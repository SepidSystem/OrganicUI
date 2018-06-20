const { join } = require('path');
const ExtractText = require('extract-text-webpack-plugin');
const babelOpts = require('./babel');
const styles = require('./styles');
const setup = require('./setup');
const package = require('../package.json');
const dist = join(__dirname, '..', 'assets', 'bundle');
const exclude = /(node_modules|bower_components)/;
module.exports = env => {
	const isProd = env && env.production;

	if (isProd) {
		babelOpts.presets.push('babili');
	} else {
		styles.unshift({ loader: 'style-loader' });

	}

	return {
		optimization: {
			splitChunks: {
				cacheGroups: {
					commons: {
						test: /[\\/]node_modules[\\/]/,
						name: "vendors",
						chunks: "all"
					}
				}

			}
		},
		watch: !env,
		entry: {
			vendors: './src/imported-vendors',
			organicUI: ['./src/organicUI.tsx', './src/organicUI-init.tsx'],
			devtools: ['./src/dev-tools.tsx'],
			domain: './src/domain/domain.tsx', 'domain-FA_IR': './src/domain/domain-FA_IR.tsx',
		},
		output: {
			path: dist,
			filename: '[name].js',
			publicPath: '/'
		}, stats: {
			colors: true,
			modules: true,
			reasons: true,
			errorDetails: true
		},
		resolve: {
			extensions: ['.ts', '.js', '.json', '.tsx', '.jsx']
		},
		module: {
			rules: [{
				test: /\.(scss|sass)$/,
				use: [
					'css-loader',
					{
						loader: 'fast-sass-loader'
					}
				]
			}, {
				test: /\.jsx?$/,
				exclude,
				loader: {
					loader: 'babel-loader',
					options: babelOpts
				}
			}, {
				test: /\.tsx?$/,
				exclude,
				loader: {
					loader: 'ts-loader'

				}
			}
			/*	, {
				test: /\.(sass|scss)$/,
				use: isProd ? ExtractText.extract({ fallback: 'style-loader', use: styles }) : styles
			}*/]
		},
		plugins: setup(isProd),
		//devtool: !isProd && 'eval',
		devServer: {
			contentBase: dist,
			port: process.env.PORT || 3000,
			historyApiFallback: true,
			compress: isProd,
			inline: !isProd,
			hot: !isProd
		}
	};
};
