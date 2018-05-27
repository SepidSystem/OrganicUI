const { join } = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');

const root = join(__dirname, '..');

module.exports = production => {
	// base plugins array
	const plugins = [

		new webpack.optimize.CommonsChunkPlugin({ name: 'vendors' }),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')
		})
	];

	if (production) {
		plugins.push(
			new MinifyPlugin(),
			new webpack.LoaderOptionsPlugin({ minimize: true }),
			new webpack.optimize.ModuleConcatenationPlugin()

		);
	} else {
		// dev only
		plugins.push(
			//		new webpack.HotModuleReplacementPlugin(),
			new webpack.NamedModulesPlugin()
		);
	}

	return plugins;
};
