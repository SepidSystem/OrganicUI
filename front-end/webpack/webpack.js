const { join } = require('path');
const babelOpts = require('./babel');
const styles = require('./styles');
const setup = require('./setup');
const path = require('path');

const exclude = /(node_modules|bower_components)/;
const { argv } = require('yargs');

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
let _entry = {
	vendors: './src/imported-vendors.tsx',
	base: ['./src/organicUI.tsx', './src/organicUI-init.tsx'],
	'mod-dashboard': './src/modules/dashboard/mod-dashboard.tsx',
	devtools: './src/dev-tools.tsx'
};
process.env.sourceDir = process.env.sourceDir || process.cwd();
function getSourcePath(filePath) {
	if (filePath instanceof Array)
		return filePath.map(getSourcePath);
	return path.join(process.env.sourceDir || process.cwd(), filePath);
}
const entry = Object.assign({},
	...Object.keys(_entry)
		.filter(key => fileExists(getSourcePath(_entry[key])))
		.map(key => ({ [key]: getSourcePath(_entry[key]) })));

const dist ='C:\\Taheri\\Test1\\public\\bundle';// join(process.env.sourceDir, 'assets', 'bundle');
const rules = [

	{
		test: /\.css$/,
		loaders: ['style-loader', 'css-loader?modules=true&camelCase=true&localIdentName=[local]']

	},
	{
		test: /\.svg$/,
		loader: ['svg-inline-loader']
	}, {
		test: /\.jsx?$/,
		exclude,
		loader: [  {
			loader: 'babel-loader',
			options: babelOpts
		}]
	}, {
		test: /\.tsx?$/,
		exclude,
		loader:   { loader: 'ts-loader',options:{
			transpileOnly:true
		}}
	}].filter(x => !!x);
module.exports = env => {
	env.mode && Object.assign(env, { [env.mode]: true });
	const isProd = (env && env.production);
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
				'@organic-ui': path.resolve(__dirname, 'organic-ui-alias'),
			}
		},
		module: { rules },
		plugins
	};
};
