const { join } = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const fs = require('fs');
const root = join(__dirname, '..');
const DashboardPlugin = require('webpack-dashboard/plugin');

function getBuildNum() {
	const buildNumFile = join(__dirname, './build-num.json')
	const now = new Date();
	const masterKey = now.getFullYear() + '' + ('00' + now.getMonth()).substr(-2);
	let buildNum = { masterKey, counter: 0 };
	try {
		buildNum = require(buildNumFile);
	} catch{ }
	buildNum.counter = buildNum.counter || 0;
	if (buildNum.masterKey != masterKey) {
		buildNum.counter = 0;
		buildNum.masterKey;
	}
	buildNum.counter++;
	fs.writeFileSync(buildNumFile, JSON.stringify(buildNum), { encoding: 'utf-8' });
	return buildNum.counter;

}
module.exports = production => {
	const now = new Date();
	const buildDate = now.toISOString().split('T')[0].split('-').join('');

	const plugins = [
		!production && new FriendlyErrorsWebpackPlugin(),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
			'BUILD_DATE': JSON.stringify(buildDate),
			'BUILD_NUMBER': webpack.DefinePlugin.runtimeValue(() => JSON.stringify(getBuildNum()))
		})
	];

	if (production) {
		plugins.push(
			new MinifyPlugin(),
			new webpack.LoaderOptionsPlugin({ minimize: true })

		);
	} else {
		// dev only
		plugins.push(
			//		new webpack.HotModuleReplacementPlugin(),
			new webpack.NamedModulesPlugin(),
			new DashboardPlugin()
		);
	}

	return plugins.filter(x => !!x);
};
