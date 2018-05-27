const changeChange = require('change-case-object');
const camelCase = require('camelcase');
const mysql = require('mysql');
const globalConnection = mysql.createConnection(
    { stringifyObjects: true, host: '127.0.0.1', user: 'root', password: 'mysql' }
);
const keywords =
    ["SELECT", "FROM", "WHERE", "UPDATE", "SET", "DELETE", "INNER", "JOIN", "OUTTER", "LEFT", "RIGHT"].reduce((a, b) => (a[b] = 1, a), {});
class SqlStatement {
    constructor(sqlCode) {
        this.sqlCode = sqlCode;
        this.connection = globalConnection;
    }

    execute(params) {
        return new Promise((resolve, reject) => {
            params = changeChange.camelCase(params);
            const values = [];
            const parsedSQL = this.sqlCode.replace(
                /\@([a-z0-9_])+/igm,
                s => values.push(params[camelCase(s.substr(1))]), '?');
            this.connection.query(parsedSQL, values, (err, rows) => err ? reject(err) : resolve(rows));
        });
    }
    static getLineCol(s, idx) {
        let col = 1;
        let line = 1;
        let newline=false;
        for (var ch of Array.from(s)) {
            if(!idx--) break;
            if (ch == '\n' || ch == '\r' && !newline) {newline=true; col = 1; line++ }
            else {
                col++;
                newline=false;
			}
		}
        return {col,line};
    }
    static verify(sql) {
        const words = [];
        const p = /[a-z0-9_]+/igm;
      
        while ((array1 = p.exec(sql)) !== null) {
            const w = array1[0];
            
            if(!keywords[w.toUpperCase()] || w == w.toUpperCase()) continue;
            return Object.assign({sql},getLineCol(sql,p.lastIndex));
        }
       
    }
}
require.extensions['.sql'] = fn => {
    const sql = readFileSync(fn, { encoding: 'utf-8' });
    if (!SqlStatement.verify(sql)) {

    }
    return new SqlStatement(sql);
}

module.SqlStatement = SqlStatement;