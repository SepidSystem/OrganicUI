const { join } = require('path');
const ExtractText = require('extract-text-webpack-plugin');
const babelOpts = require('./babel');
const styles = require('./styles');
const setup = require('./setup');
const path = require('path');
const package = require('../package.json');
const dist = join(__dirname, '..', 'assets', 'bundle');
const exclude = /(node_modules|bower_components)/;
const { argv } = require('yargs');
const CleanEntryPlugin = require('clean-entry-webpack-plugin');
const { statSync } = require('fs');
const fileExists = filePath => {
	const filePathArray = filePath instanceof Array ? filePath : [filePath];
	try {
		for (const fileName of filePathArray) {
			const r = statSync(fileName);
			if (!r.size) return false;
		}
		return true;
	}
	catch{
		return false;
	}
}
const _entry = {
	vendors: './src/imported-vendors.tsx',
	organicUI: ['./src/organicUI.tsx', './src/organicUI-init.tsx'],
	devtools: ['./src/dev-tools.tsx'],
	domain: './src/domain/domain.tsx',
	'domain-FA_IR': './src/domain/domain-FA_IR.tsx',
};
const entry = Object.keys(_entry).filter(key => fileExists(_entry[key])).reduce((a, key) => Object.assign(a, { [key]: _entry[key] }), {});
 
module.exports = env => {
	const isProd = env && env.production;
	const plugins = setup(isProd);
	if (isProd) {
		babelOpts.presets.push('babili');
	} else {
		styles.unshift({ loader: 'style-loader' });

	}

	return {
		optimization: {
			splitChunks: !argv.entry && {
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
		entry,
		output: {
			path: dist,
			filename: '[name].js',
			publicPath: '/'
		},
		stats: 'minimal',
		resolve: {
			extensions: ['.ts', '.js', '.css', '.json', '.tsx', '.jsx'],
			alias: {
				'@organic-ui': path.resolve(__dirname, '../src/organic-ui-alias'),

			}
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					loaders: ['style-loader', 'css-loader?modules=true&camelCase=true&localIdentName=[local]']

				},
				{
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
		plugins
	};
};
