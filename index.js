const fs = require('fs');
// const http = require('http');
const md5 = require('md5');
const path = require('path');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' })
const bodyParser = require('body-parser');

var nodemailer = require('nodemailer');

const { APP_PORT, APP_IP, APP_PATH } = process.env;
const PORT = 5000;
const express = require('express')
var cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
var http = require('http').createServer(app);
// const port = 3000
// http.listen(APP_PORT, APP_IP, () => {
//     console.log(`listening on *:${PORT}`);
// });
app.listen(APP_PORT, APP_IP, () => {
  console.log(`Example app listening on port ${APP_PORT}`)
})

const mysql = require("mysql");
  
const connection = mysql.createConnection({
  socketPath: "/var/run/mysqld/mysqld.sock",
  user: "c57366_u103146_na4u_ru",
  database: "c57366_u103146_na4u_ru",
  password: "ViNdiLapbuhih39"
});

connection.connect(function(err){
  if (err) {
    return console.error("Ошибка: " + err.message);
  }
  else{
    console.log("Подключение к серверу MySQL успешно установлено");
  }
});


var transporter = nodemailer.createTransport({
    // host: 'mail.netangels.ru',
    host: 'localhost',
    port: 25,
    // secure: false,
    // auth: {
    //     user: 'robot',
    // //   pass: 'tim16432%SRG9202'
    //     pass: '9j202551',
    // },
    tls: {
        rejectUnauthorized: false
    }
});
  
app.get('/', (req, res) => {
  const sql_params = ['testname']
  const sql = `
            INSERT INTO test (name) 
            VALUES(?)`
  connection.query(sql, sql_params, function(err, results) {
      if(err) console.log(err);
      else 
      {
        res.send({'res': 'Hello World!' + results.insertId.toString()})
      }
  });
})

app.post('/login', upload.single('avatar'), function (req, res, next) {
    let username = req.body.username
    let password = req.body.password
    console.log("User Login", username, password)
    let sql_params = [username]
    const sql = "SELECT id, username, password FROM user WHERE username=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                console.log("User Login", results)
                if (results.length == 1 && md5(password) == results[0].password) {
                    res.send({'res': true, 'user_id': results[0].id, 'adm': true})
                }
                else {
                    const sql1 = "SELECT id, name, business_id, password FROM employs WHERE name=?"
                    connection.query(sql1, sql_params, function(err, results) {
                        if(err) console.log(err);
                        else 
                        {
                            console.log("User Login", results, md5(password), results[0].password)
                            if (results.length == 1 && md5(password) == results[0].password) {
                                res.send({'res': true, 'user_id': results[0].id, 'adm': false, 'business_id': results[0].business_id})
                            }
                            else {
                                res.send({'res': false})
                            }
                            
                        }
                    });
                }
                
            }
        });
})

app.post('/reg', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let username = req.body.username
    let password = req.body.password
    console.log('username', username, password)
    const user = [username, md5(password)];
    const sql = "INSERT INTO user (username, password) VALUES(?, ?)";
    connection.query(sql, user, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("Данные добавлены", results);
            res.send({'res': true})
        }
    });
})

app.post('/business', upload.single('avatar'), function (req, res, next) {
    console.log('business', req.body)
    let user_id = req.body.user_id
    console.log('user_id', user_id)
    let sql_params = [user_id]
    const sql = "SELECT id, name FROM business WHERE user_id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'business': results})
                
            }
        });
})

app.post('/newbusiness', upload.single('avatar'), function (req, res, next) {
    console.log('business', req.body)
    let user_id = req.body.user_id
    let business_name = req.body.business_name
    console.log('user_id', user_id)
    let sql_params = [business_name, user_id]
    const sql = "INSERT INTO business (name, user_id) VALUES(?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true, 'id': results.insertId})
            }
        });
})

//GROUP

app.post('/groups', upload.single('avatar'), function (req, res, next) {
    console.log('groups', req.body)
    let user_id = req.body.user_id
    let business_id = req.body.business_id
    let group_id = req.body.group_id
    console.log('user_id', user_id)
    let sql_params = [business_id, group_id]
    const sql = "SELECT id, name FROM groups WHERE business_id=? AND group_id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'groups': results})
                
            }
        });
})


app.post('/newgroup', upload.single('avatar'), function (req, res, next) {
    console.log('business', req.body)
    let business_id = req.body.business_id
    let group_name = req.body.group_name
    let group_id = req.body.group_id
    
    console.log('business_id', business_id)
    let sql_params = [group_name, business_id, group_id]
    const sql = "INSERT INTO groups (name, business_id, group_id) VALUES(?, ?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true, 'id': results.insertId})
            }
        });
})

app.post('/editgroup', upload.single('avatar'), function (req, res, next) {
    console.log('editgroup', req.body)
    let group_id = req.body.group_id
    let group_name = req.body.group_name
    let sql_params = [group_name, group_id]
    const sql = "UPDATE groups SET name=? WHERE id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true})
            }
        });
})

//EMPLOYS

app.post('/employs', upload.single('avatar'), function (req, res, next) {
    console.log('employs', req.body)
    let user_id = req.body.user_id
    let business_id = req.body.business_id
    console.log('user_id', user_id)
    let sql_params = [business_id]
    const sql = "SELECT id, name FROM employs WHERE business_id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'employs': results})
                
            }
        });
})


app.post('/newemploy', upload.single('avatar'), function (req, res, next) {
    console.log('business', req.body)
    let business_id = req.body.business_id
    let name = req.body.name
    let mail = req.body.mail
    
    var randomstring = Math.random().toString(36).slice(-8);
    let password = md5(randomstring)
    
    let sql_params = [name, business_id, password, mail]                
    const sql = "INSERT INTO employs (name, business_id, password, mail) VALUES(?, ?, ?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                var mailOptions = {
                    from: 'sale@gmail.com',
                    to: mail,
                    subject: 'Добрый день, ' + name,
                    text: 'Вы зарегестрированы как сотрудник, ваш пароль: ' + randomstring,
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    } else {
                    console.log('Email from sale sent: ' + info.response);
                    }
                });   
                res.send({'res': true, 'id': results.insertId})
            }
        });
})


app.post('/infoemploy', upload.single('avatar'), function (req, res, next) {
    console.log('infoemploy', req.body)
    let employ_id = req.body.employ_id
    let sql_params = [employ_id]
    const sql = `
    	SELECT roles.type as type, roles.name as name_role, employs.mail as mail, employs.name as name_employ, employ_role.id as id
    	FROM employ_role
    	INNER JOIN roles ON roles.id = employ_role.role_id
    	RIGHT JOIN employs ON employs.id = employ_role.employ_id
    	WHERE employs.id = ?
    `
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
        	let arr = []
            for (let i=0; i<results.length; i++) {
            	if (results[i].id != null) {
            		arr.push({'id': results[i].id, 'type': results[i].type, 'name_role': results[i].name_role})	
            	}
            }
            res.send({
            	'res': true, 
            	'mail_employ': results[0].mail, 
            	'roles': arr,
            	'name_employ': results[0].name_employ,
            	
            })
            
        }
    });
})



app.post('/getrolecounters', upload.single('avatar'), function (req, res, next) {
    console.log('getrolecounters', req.body)
    let employ_role_id = req.body.role_id
    let employ_id = req.body.employ_id
    
    let sql_params0 = [employ_role_id]
    let sql0 = `
    	SELECT role_id FROM employ_role WHERE id=? 
    `
    connection.query(sql0, sql_params0, function(err, results) {
        if(err) console.log(err);
        else 
        {
            if (results.length == 1) {
            	let role_id = results[0].role_id
            	let sql_params = [employ_id, role_id, employ_role_id]
			    const sql = `
			    	SELECT counterparties_employ_role.*, counters_rub.name, counters_rub.rub, (IF (counterparties_employ_role.type_salary='%', (counters_rub.rub - counters_rub.rub_buy)*salary/100, counters_rub.q*salary)) as all_salary
					FROM counterparties_employ_role
					LEFT JOIN (
					    SELECT counterparties.name as name, sales_rub.rub, sales_rub.rub_buy, sales_rub.q, counterparties.id as counter_id
					    FROM counterparties
					    LEFT JOIN (
					        SELECT SUM(product_sale.quantity*product_sale.price) as rub, sales.counterparty_id as counter_id, SUM(product_sale.quantity) as q, SUM(product_sale.quantity*product_sale.price_buy) as rub_buy,
			                	employ_sale.employ_id as employ_id
							FROM sales
							INNER JOIN (
							    SELECT product_sale.*, IF(product_buy.price_buy IS null, 0, product_buy.price_buy) as price_buy
							    FROM product_sale
							    LEFT JOIN (
							        SELECT product_buy.product_id, AVG(product_buy.price) as price_buy
							        FROM product_buy
							        GROUP BY product_buy.product_id
							    ) as product_buy ON product_buy.product_id=product_sale.product_id
							) as product_sale ON product_sale.sale_id=sales.id
							INNER JOIN employ_sale ON employ_sale.sale_id=sales.id
			                WHERE employ_id = ? AND employ_sale.role_id = ? AND sales.is_payd
							GROUP BY sales.counterparty_id
							
					    ) as sales_rub ON sales_rub.counter_id = counterparties.id
					) as counters_rub ON counters_rub.counter_id = counterparties_employ_role.counterparty_id
					WHERE counterparties_employ_role.employ_role_id = ?
			    `
			    connection.query(sql, sql_params, function(err, results) {
			        if(err) console.log(err);
			        else 
			        {
			            res.send({
			            	'res': true, 
			            	'list_role_counters': results, 
			            	
			            })
			            
			        }
			    });
            	
            }
            
        }
    });
    
    
    
})


app.post('/setrolecounter', upload.single('avatar'), function (req, res, next) {
    console.log('setrolecounter', req.body)
    let counter_id = req.body.counter_id
    let role_id = req.body.role_id
    
    let sql_params = [counter_id, role_id]                
    const sql = "INSERT INTO counterparties_employ_role (counterparty_id, employ_role_id) VALUES(?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {  
                res.send({'res': true, 'id': results.insertId})
            }
        });
})


app.post('/setsalarytype', upload.single('avatar'), function (req, res, next) {
    console.log('setsalarytype', req.body)
    let role_counter_id = req.body.role_counter_id
    let type_salary = req.body.type_salary
    let salary = req.body.salary
    let sql_params = [type_salary, salary, role_counter_id]
    const sql = "UPDATE counterparties_employ_role SET type_salary=?, salary=? WHERE id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true})
            }
        });
})


app.post('/delrole', upload.single('avatar'), function (req, res, next) {
    console.log('delrole', req.body)
    
    let role_id = req.body.role_id
    let sql_params = [role_id]
    const sql = `
    	DELETE FROM employ_role
    	WHERE id = ?
    `
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            res.send({
            	'res': true, 
            	
            })
            
        }
    });
})

app.post('/roles', upload.single('avatar'), function (req, res, next) {
    console.log('roles body', req.body)
    let employ_id = req.body.employ_id
    let sql_params = [employ_id]
    const sql = `
    	SELECT *
		FROM roles
		WHERE id NOT IN (
		    	SELECT role_id
		    	FROM employ_role
		    	WHERE employ_id = ?
		    )
    `
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
        	
            res.send({'res': true, 'roles': results})
            
        }
    });
})

app.post('/setrole', upload.single('avatar'), function (req, res, next) {
    console.log('setrole', req.body)
    let employ_id = req.body.employ_id
    let role_id = req.body.role_id
    
    let sql_params = [employ_id, role_id]                
    const sql = "INSERT INTO employ_role (employ_id, role_id) VALUES(?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {  
                res.send({'res': true, 'id': results.insertId})
            }
        });
})


//COUNTERPARTIES

app.post('/counterparties', upload.single('avatar'), function (req, res, next) {
    console.log('groups', req.body)
    let user_id = req.body.user_id
    let business_id = req.body.business_id
    console.log('user_id', user_id)
    let sql_params = [business_id]
    const sql = `
    	SELECT id, name, address, counterparties_sales.sumrub, counterparties_pays.money, counterparties_buy.sumbuy,
    		IFNULL (IFNULL(counterparties_sales.sumrub, 0)-IFNULL(counterparties_pays.money, 0) + IFNULL(counterparties_getpay.sendmoney, 0) - IFNULL(counterparties_buy.sumbuy, 0), 0) as debt,
    		counterparties_getpay.sendmoney
		FROM counterparties 
		LEFT JOIN (
		    
			SELECT SUM(product_sale.quantity * product_sale.price) AS sumrub, product_sale.sale_id, sales.counterparty_id
		    FROM product_sale
		    LEFT JOIN sales ON sales.id = product_sale.sale_id
		    WHERE sales.status = 'issaled'
		    GROUP BY sales.counterparty_id
		) AS counterparties_sales ON counterparties_sales.counterparty_id = counterparties.id
		LEFT JOIN (
			SELECT SUM(product_buy.quantity * product_buy.price) AS sumbuy, product_buy.buy_id, buyies.counterparty_id
		    FROM product_buy
		    LEFT JOIN buyies ON buyies.id = product_buy.buy_id
		    WHERE buyies.status = 'isbuyied'
		    GROUP BY buyies.counterparty_id
		) AS counterparties_buy ON counterparties_buy.counterparty_id = counterparties.id
		LEFT JOIN (
			SELECT payments.counterparty_id, SUM(payments.money) AS money
		    FROM payments 
		    WHERE payments.incoming 
		    GROUP BY payments.counterparty_id
		) AS counterparties_pays ON counterparties_pays.counterparty_id = counterparties.id
		LEFT JOIN (
			SELECT payments.counterparty_id, SUM(payments.money) AS sendmoney
		    FROM payments 
		    WHERE NOT payments.incoming 
		    GROUP BY payments.counterparty_id
		) AS counterparties_getpay ON counterparties_getpay.counterparty_id = counterparties.id
		WHERE business_id=?
    `
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'counterparties': results})
                
            }
        });
})


app.post('/newcounterparty', upload.single('avatar'), function (req, res, next) {
    console.log('business', req.body)
    let business_id = req.body.business_id
    let name = req.body.name
    let address = req.body.address
    
    console.log('business_id', business_id)
    let sql_params = [name, address, business_id]
    const sql = "INSERT INTO counterparties (name, address, business_id) VALUES(?, ?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true, 'id': results.insertId})
            }
        });
})



//PRODUCT

app.post('/products', upload.single('avatar'), function (req, res, next) {
    console.log('products', req.body)
    let group_id = req.body.group_id
    console.log('group_id', group_id)
    let sql_params = [group_id]
    const sql = "SELECT id, name FROM products WHERE group_id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'products': results})
                
            }
        });
})

app.post('/newproduct', upload.single('avatar'), function (req, res, next) {
    console.log('newproduct', req.body)
    let group_id = req.body.group_id
    let product_name = req.body.product_name
    let business_id = req.body.business_id
    
    let sql_params = [product_name, group_id]
    const sql = "INSERT INTO products (name, group_id) VALUES(?, ?)"
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            res.send({'res': true, 'id': results.insertId})
            
            let sql_params1 = [results.insertId, business_id]
		    const sql1 = `
		    	INSERT INTO product_warehouse (product_id, warehouse_id) 
                    SELECT products_sale.product_id as product_id, warehouse.id as warehouse_id
                    FROM warehouse
                    RIGHT JOIN (
                        SELECT products.id as product_id, groups.business_id as business_id
                        FROM products
                        LEFT JOIN groups ON groups.id=products.group_id
                        WHERE products.id=?
                    ) as products_sale ON products_sale.business_id=warehouse.business_id
                    WHERE warehouse.business_id = ?
		    `
		    connection.query(sql1, sql_params1, function(err, results) {
		        if(err) console.log(err);
		        else 
		        {
		            console.log('insert into product_warehouse is good', results.insertId, business_id)
		        }
		    });
        }
    });
})


app.post('/editproduct', upload.single('avatar'), function (req, res, next) {
    console.log('editproduct', req.body)
    let product_id = req.body.product_id
    let product_name = req.body.product_name
    let sql_params = [product_name, product_id]
    const sql = "UPDATE products SET name=? WHERE id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true})
            }
        });
})


//WAREHOUSES

app.post('/warehouses', upload.single('avatar'), function (req, res, next) {
    console.log('warehouses', req.body)
    let user_id = req.body.user_id
    let business_id = req.body.business_id
    console.log('user_id', user_id)
    let sql_params = [business_id]
    const sql = "SELECT id, name FROM warehouse WHERE business_id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'warehouses': results})
                
            }
        });
})


app.post('/newwarehouse', upload.single('avatar'), function (req, res, next) {
    console.log('newwarehouse', req.body)
    let business_id = req.body.business_id
    let name = req.body.name
    let sql_params = [name, business_id]
    const sql = "INSERT INTO warehouse (name, business_id) VALUES(?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                let sql_params1 = [business_id, results.insertId]
                let sql1 = `
                    INSERT INTO product_warehouse (product_id, warehouse_id) 
                        SELECT products_sale.product_id as product_id, warehouse.id as warehouse_id
                        FROM warehouse
                        RIGHT JOIN (
                            SELECT products.id as product_id, groups.business_id as business_id
                            FROM products
                            LEFT JOIN groups ON groups.id=products.group_id
                            WHERE groups.business_id=?
                        ) as products_sale ON products_sale.business_id=warehouse.business_id
                        WHERE warehouse.id = ?
                `
                connection.query(sql1, sql_params1, function(err, results) {
                    if(err) console.log(err);
                    else 
                    {
                        res.send({'res': true, 'id': results.insertId})
                    }
                })
                
            }
        });
})


app.post('/products/warehouse', upload.single('avatar'), function (req, res, next) {
    console.log('productswarehouse', req.body)
    let group_id = req.body.group_id
    let warehouse_id = req.body.warehouse_id
    
    console.log('warehouse_id', warehouse_id)
    let sql_params = [warehouse_id, group_id]
    const sql = `   
                    SELECT products.id, products.name, products_warehouse.quantity, products_warehouse.warehouse_id, products.group_id
                    FROM products 
                    LEFT JOIN (
                    	SELECT product_warehouse.*
                        FROM product_warehouse
                        WHERE product_warehouse.warehouse_id=?
                    ) as products_warehouse ON products_warehouse.product_id=products.id
                    WHERE products.group_id=?
                `
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'products': results})
                
            }
        });
})

//SALES

app.post('/sales', upload.single('avatar'), function (req, res, next) {
    console.log('sales', req.body)
    let user_id = req.body.user_id
    let business_id = req.body.business_id
    let date_start = req.body.date_start
    let date_end = req.body.date_end
    date_start = new Date(date_start)
    date_end = new Date(date_end)
    date_start.setHours(0, 0, 0, 0);
    date_end.setHours(23,59,59,0);
    console.log('user_id', user_id)
    let sql_params = [date_start, date_end, business_id]
    const sql = `
            SELECT sales.*, 
                counterparties.id as counterparty_id,  
                counterparties.name, 
                counterparties.address, 
                counterparties.business_id, 
                product_sale.sumrub, 
                warehouse.name as warehouse_name,
                warehouse.id as warehouse_id
            FROM sales 
            INNER JOIN counterparties ON sales.counterparty_id=counterparties.id
            INNER JOIN (
            	SELECT SUM(product_sale.quantity * product_sale.price) AS sumrub, product_sale.sale_id 
                FROM product_sale
                GROUP BY product_sale.sale_id
            ) AS product_sale ON product_sale.sale_id=sales.id
            LEFT JOIN warehouse ON warehouse.id=sales.warehouse_id
            WHERE (sales.datetime BETWEEN ? AND ?)
                AND (counterparties.business_id = ?)
        `
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'sales': results})
                
            }
        });
})


app.post('/saleproducts', upload.single('avatar'), function (req, res, next) {
    console.log('saleproducts', req.body)
    let sale_id = req.body.sale_id
    console.log('sale_id', sale_id)
    let sql_params = [sale_id]
    const sql = `
                    SELECT product_sale.*, products.name
                    FROM product_sale
                    INNER JOIN products ON products.id=product_sale.product_id
                    WHERE sale_id = ?
                `
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'saleproducts': results})
                
            }
        });
})

app.post('/delproductsale', upload.single('avatar'), function (req, res, next) {
    console.log('delproductsale', req.body)
    
    let product_sale_id = req.body.product_sale_id
    let sql_params = [product_sale_id]
    const sql = `
    	DELETE FROM product_sale
    	WHERE id = ?
    `
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            res.send({
            	'res': true, 
            	
            })
            
        }
    });
})


app.post('/newsale', upload.single('avatar'), function (req, res, next) {
    console.log('newsale', req.body)
    let business_id = req.body.business_id
    let counterparty_id = req.body.counterparty_id;
    let listProducts = req.body.listProducts;
    let typeSale = req.body.typeSale;
    let SaleId = req.body.SaleId;
    let WareHouse_id = req.body.WareHouse_id;
    console.log('listProducts', req.body.listProducts.listProducts)
    console.log('listProducts', req.body)
    
    if (typeSale == 'Новая продажа') {
        let datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
        let sql_params = [counterparty_id, datetime, '', WareHouse_id]
        
        const sql = "INSERT INTO sales (counterparty_id, datetime, status, warehouse_id) VALUES(?, ?, ?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                let sale_id = results.insertId
                for (let i=0; i<listProducts.length; i++) {
                    if (listProducts[i].id <= 0 && listProducts[i].quantity != -1) {
                        let product_id = listProducts[i].product_id
                        let quantity = listProducts[i].quantity
                        let price = listProducts[i].price
                        let sql_params1 = [sale_id, product_id, quantity, price]
        
                        const sql1 = "INSERT INTO product_sale (sale_id, product_id, quantity, price) VALUES(?, ?, ?, ?)"
                        connection.query(sql1, sql_params1, function(err, results) {
                                if(err) console.log(err);
                                else 
                                {
                                    console.log('product is add')
                                }
                        });
                    }
                    
                }
                res.send({'res': true, 'id': results.insertId})
            }
        });
    }
    else if (typeSale == 'Продажа') {
        let sql_params = [counterparty_id, WareHouse_id, SaleId]
        
        const sql = "UPDATE sales SET counterparty_id=?, warehouse_id=? WHERE id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                let sale_id = SaleId
                for (let i=0; i<listProducts.length; i++) {
                	
                	if (listProducts[i].quantity == -1 && listProducts[i].id > 0) {
                		let sql_params = [listProducts[i].id]
					    const sql = `
					    	DELETE FROM product_sale
					    	WHERE id = ?
					    `
					    connection.query(sql, sql_params, function(err, results) {
					        if(err) console.log(err);
					        else 
					        {
					            console.log('product is delete')
					            
					        }
					    });
                	}
                    else if (listProducts[i].id <= 0 && listProducts[i].quantity != -1) {
                        let product_id = listProducts[i].product_id
                        let quantity = listProducts[i].quantity
                        let price = listProducts[i].price
                        let sql_params1 = [sale_id, product_id, quantity, price]
        
                        const sql1 = "INSERT INTO product_sale (sale_id, product_id, quantity, price) VALUES(?, ?, ?, ?)"
                        connection.query(sql1, sql_params1, function(err, results) {
                                if(err) console.log(err);
                                else 
                                {
                                    console.log('product is add')
                                }
                        });
                    }
                    
                }
                res.send({'res': true, 'id': sale_id})
            }
        })
    }
    
})


app.post('/newstatus', upload.single('avatar'), function (req, res, next) {
    console.log('newstatus', req.body)
    let sale_id = req.body.sale_id;
    let status = req.body.status;
    let warehouse_id = req.body.warehouse_id;
    let user_id = req.body.user_id;
    let counterparty_id = req.body.counterparty_id;
    
    let type_role = 'agent'
    let role_id = 2
    if (status == 'isload') {
    	type_role = 'sklad'
    	role_id = 1
    }
    const sql_params0 = [user_id, type_role, counterparty_id]
    const sql0 = `
    	SELECT roles.type as type, counterparties_employ_role.type_salary, counterparties_employ_role.salary
    	FROM employ_role
    	INNER JOIN roles ON roles.id = employ_role.role_id
    	INNER JOIN counterparties_employ_role ON counterparties_employ_role.employ_role_id=employ_role.id
    	WHERE employ_role.employ_id = ? AND roles.type = ? AND counterparties_employ_role.counterparty_id = ?
    `
    connection.query(sql0, sql_params0, function(err, results) { 
        if(err) console.log(err);
        else 
        {
        	if (results.length == 1) {
        		let type_salary = results[0].type_salary
        		let salary = results[0].salary
        		
        		const sql_params = [status, sale_id]
			    let sql = `
			        UPDATE sales
			        SET status = ?
			        WHERE id = ?
			    `
			    connection.query(sql, sql_params, function(err, results) {
			        if(err) console.log(err);
			        else 
			        {
			            console.log("newstatus", results) 
			            if (status == 'issaled') {
			                const sql_params1 = [sale_id, warehouse_id]
			                let sql1 = `
			                    UPDATE product_warehouse, product_sale
			                    SET product_warehouse.quantity = product_warehouse.quantity - product_sale.quantity
			                    WHERE product_warehouse.product_id=product_sale.product_id AND product_sale.sale_id=? AND product_warehouse.warehouse_id=?
			                `
			                connection.query(sql1, sql_params1, function(err, results) {
			                    if(err) console.log(err);
			                    else 
			                    {         
			                        res.send({'res': true})
			                        
			                    }
			                })
			            }
			            else {
			            	
			                res.send({'res': true})
			            }  
			            
			            let sql_params2 = [user_id, sale_id, type_salary, salary, role_id]
                        const sql2 = "INSERT INTO employ_sale (employ_id, sale_id, type, salary, role_id) VALUES(?, ?, ?, ?, ?)"
                        connection.query(sql2, sql_params2, function(err, results) {
                                if(err) console.log(err);
                                else 
                                {
                                    console.log('employ_sale is add')
                                }
                        })
			            
			            
			        }
			    });
        	}
        	else {
        		res.send({'res': false, 'err': 'role'})
        	}
        }
    })
    
    
})

//BUYIES

app.post('/buyies', upload.single('avatar'), function (req, res, next) {
    console.log('buyies', req.body)
    let user_id = req.body.user_id
    let business_id = req.body.business_id
    let date_start = req.body.date_start
    let date_end = req.body.date_end
    date_start = new Date(date_start)
    date_end = new Date(date_end)
    date_start.setHours(0, 0, 0, 0);
    date_end.setHours(23,59,59,0);
    console.log('user_id', user_id)
    let sql_params = [date_start, date_end, business_id]
    const sql = `
            SELECT buyies.*, 
                counterparties.id as counterparty_id,  
                counterparties.name, 
                counterparties.address, 
                counterparties.business_id, 
                product_buy.sumrub, 
                warehouse.name as warehouse_name,
                warehouse.id as warehouse_id
            FROM buyies 
            INNER JOIN counterparties ON buyies.counterparty_id=counterparties.id
            INNER JOIN (
            	SELECT SUM(product_buy.quantity * product_buy.price) AS sumrub, product_buy.buy_id 
                FROM product_buy
                GROUP BY product_buy.buy_id
            ) AS product_buy ON product_buy.buy_id=buyies.id
            LEFT JOIN warehouse ON warehouse.id=buyies.warehouse_id
            WHERE (buyies.datetime BETWEEN ? AND ?)
                AND (counterparties.business_id = ?)
        `
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'buyies': results})
                
            }
        });
})

app.post('/buyproducts', upload.single('avatar'), function (req, res, next) {
    console.log('buyproducts', req.body)
    let buy_id = req.body.buy_id
    console.log('buy_id', buy_id)
    let sql_params = [buy_id]
    const sql = `
                    SELECT product_buy.*, products.name
                    FROM product_buy
                    INNER JOIN products ON products.id=product_buy.product_id
                    WHERE buy_id = ?
                `
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'buyproducts': results})
                
            }
        });
})

app.post('/newbuy', upload.single('avatar'), function (req, res, next) {
    console.log('newbuy', req.body)
    let business_id = req.body.business_id
    let counterparty_id = req.body.counterparty_id;
    let listProducts = req.body.listProducts;
    let typeBuy = req.body.typeBuy;
    let BuyId = req.body.BuyId;
    let WareHouse_id = req.body.warehouse_id;
    // console.log('listProducts', req.body)
    
    if (typeBuy == 'Новое поступление') {
        console.log('Новое поступление')
        let datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
        let sql_params = [counterparty_id, datetime, '', WareHouse_id]
        
        const sql = "INSERT INTO buyies (counterparty_id, datetime, status, warehouse_id) VALUES(?, ?, ?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                let buy_id = results.insertId
                for (let i=0; i<listProducts.length; i++) {
                    if (listProducts[i].id <= 0 && listProducts[i].quantity != -1) {
                        let product_id = listProducts[i].product_id
                        let quantity = listProducts[i].quantity
                        let price = listProducts[i].price
                        let sql_params1 = [buy_id, product_id, quantity, price]
        
                        const sql1 = "INSERT INTO product_buy (buy_id, product_id, quantity, price) VALUES(?, ?, ?, ?)"
                        connection.query(sql1, sql_params1, function(err, results) {
                                if(err) console.log(err);
                                else 
                                {
                                    console.log('product is add')
                                }
                        });
                    }
                    
                }
                res.send({'res': true, 'id': results.insertId})
            }
        });
    }
    else if (typeBuy == 'Поступление') {
        let sql_params = [counterparty_id, WareHouse_id, BuyId]
        
        const sql = "UPDATE buyies SET counterparty_id=?, warehouse_id=? WHERE id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                let buy_id = BuyId
                for (let i=0; i<listProducts.length; i++) {
                    if (listProducts[i].id <= 0 && listProducts[i].quantity != -1) {
                        let product_id = listProducts[i].product_id
                        let quantity = listProducts[i].quantity
                        let price = listProducts[i].price
                        let sql_params1 = [buy_id, product_id, quantity, price]
        
                        const sql1 = "INSERT INTO product_buy (buy_id, product_id, quantity, price) VALUES(?, ?, ?, ?)"
                        connection.query(sql1, sql_params1, function(err, results) {
                                if(err) console.log(err);
                                else 
                                {
                                    console.log('product is add')
                                }
                        });
                    }
                    else if (listProducts[i].quantity == -1 && listProducts[i].id > 0) {
                    	let sql_params = [listProducts[i].id]
					    const sql = `
					    	DELETE FROM product_buy
					    	WHERE id = ?
					    `
					    connection.query(sql, sql_params, function(err, results) {
					        if(err) console.log(err);
					        else 
					        {
					            console.log('product buy is delete')
					            
					        }
					    });
                    }
                    
                }
                res.send({'res': true, 'id': buy_id})
            }
        })
    }
    
})

app.post('/newstatusbuy', upload.single('avatar'), function (req, res, next) {
    console.log('newstatus', req.body)
    let buy_id = req.body.buy_id;
    let status = req.body.status;
    let warehouse_id = req.body.warehouse_id;
    const sql_params = [status, buy_id]
    let sql = `
        UPDATE buyies
        SET status = ?
        WHERE id = ?
    `
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("newstatus", results) 
            if (status == 'isbuyied') {
                const sql_params1 = [buy_id, warehouse_id]
                let sql1 = `
                    UPDATE product_warehouse, product_buy
                    SET product_warehouse.quantity = product_warehouse.quantity + product_buy.quantity
                    WHERE product_warehouse.product_id=product_buy.product_id AND product_buy.buy_id=? AND product_warehouse.warehouse_id=?
                `
                connection.query(sql1, sql_params1, function(err, results) {
                    if(err) console.log(err);
                    else 
                    {  
                        res.send({'res': true})
                    }
                })
            }
            else {
                res.send({'res': true})
            }      
        }
    });
})

//BANKS

app.post('/getbanks', upload.single('avatar'), function (req, res, next) {
    console.log('groups', req.body)
    let user_id = req.body.user_id
    let business_id = req.body.business_id
    console.log('user_id', user_id)
    let sql_params = [business_id]
    const sql = "SELECT id, name, money, is_cash FROM banks WHERE business_id=?"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'banks': results})
                
            }
        });
})

app.post('/newbank', upload.single('avatar'), function (req, res, next) {
    console.log('newbank', req.body)
    let business_id = req.body.business_id
    let name_bank = req.body.name_bank
    let money = req.body.money
    let is_cash = req.body.is_cash
    
    let sql_params = [business_id, name_bank, money, is_cash]
    const sql = "INSERT INTO banks (business_id, name, money, is_cash) VALUES(?, ?, ?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                res.send({'res': true, 'id': results.insertId})
            }
        });
})


//PAYMENTS

app.post('/getpayments', upload.single('avatar'), function (req, res, next) {
    console.log('getpayments', req.body)
    let bank_id = req.body.bank_id
    console.log('bank_id', bank_id)
    let sql_params = [bank_id]
    const sql = `
    				SELECT payments.*, counterparties.name 
					FROM payments
					INNER JOIN counterparties ON counterparties.id = payments.counterparty_id
					WHERE bank_id = ?
				`
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
                
                res.send({'payments': results})
                
            }
        });
})


app.post('/newpayment', upload.single('avatar'), function (req, res, next) {
    console.log('newpayment', req.body)
    let bank_id = req.body.bank_id
    let counterparty_id = req.body.counterparty_id
    let money = req.body.money
    let incoming = req.body.incoming
    let sale_id = req.body.sale_id
    let datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let buy_id = 0
    if (!incoming) {
    	buy_id = sale_id
    	sale_id = 0
    }
    
    let sql_params = [counterparty_id, incoming, sale_id, datetime, bank_id, money, buy_id]
    const sql = "INSERT INTO payments (counterparty_id, incoming, sale_id, datetime, bank_id, money, buy_id) VALUES(?, ?, ?, ?, ?, ?, ?)"
        connection.query(sql, sql_params, function(err, results) {
            if(err) console.log(err);
            else 
            {
            	if (!incoming) {
            		money = -money
            	}
            	const sql_params1 = [money, bank_id]
                let sql1 = `
                    UPDATE banks
                    SET banks.money = banks.money + ?
                    WHERE banks.id=?
                `
                connection.query(sql1, sql_params1, function(err, results) {
                    if(err) console.log(err);
                    else 
                    {         
                        res.send({'res': true, 'id': results.insertId, 'date': datetime})
                    }
                })
                
                const sql_params2 = [sale_id, sale_id]
                let sql2 = `
                	SELECT product_sale.*, SUM(product_sale.quantity*product_sale.price) as sum_rub, sum_pays.sum_pay
					FROM product_sale 
					LEFT JOIN (
					    SELECT SUM(payments.money) as sum_pay, payments.sale_id
					    FROM payments
					    WHERE payments.sale_id = ?
					) as sum_pays ON sum_pays.sale_id = product_sale.sale_id
					WHERE product_sale.sale_id = ?
                `
                connection.query(sql2, sql_params2, function(err, results) {
                    if(err) console.log(err);
                    else 
                    {         
                        if (results.length == 1) {
                        	if (results[0].sum_rub <= results[0].sum_pay) {
                        		const sql_params3 = [sale_id]
				                let sql3 = `
				                    UPDATE sales
				                    SET sales.is_payd = true
				                    WHERE sales.id=?
				                `
				                connection.query(sql3, sql_params3, function(err, results) {
				                    if(err) console.log(err);
				                    else 
				                    {         
				                        console.log('sale set payd')
				                    }
				                })
                        	}
                        }
                    }
                })
                
                
                
            }
        });
})


//dom
app.post('/dreg', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let email = req.body.email
    let password = req.body.password
    const sql_params = [email, password];
    const sql = "INSERT INTO duser (email, password) VALUES(?, ?)";
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("Данные добавлены", results);
            var mailOptions = {
                    from: 'domstrahovanie@gmail.com',
                    to: email,
                    subject: 'Добрый день!',
                    text: 'Вы зарегестрированы в ДомСтрахование, ваш пароль: ' + password,
                };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                console.log(error);
                } else {
                console.log('Email from sale sent: ' + info.response);
                }
            });   
            res.send({'res': true, 'id': results.insertId})
        }
    });
})

app.post('/dforgetpassword', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let email = req.body.email
    const sql_params = [email];
    const sql = "SELECT password FROM duser WHERE email = ?";
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("dforgetpassword select res ", results);
            if (results.length == 1) {
            	var mailOptions = {
                    from: 'domstrahovanie@gmail.com',
                    to: email,
                    subject: 'Добрый день!',
                    text: 'Ваш пароль: ' + results[0].password,
                };
	            transporter.sendMail(mailOptions, function(error, info){
	                if (error) {
	                console.log(error);
	                } else {
	                console.log('Email from sale sent: ' + info.response);
	                }
	            });   
	            res.send({'res': true, 'id': results.insertId})
            }
            else {
            	res.send({'res': false})
            }
            
        }
    });
})

app.post('/dlogin', upload.single('avatar'), function (req, res, next) {
    console.log('body_reg', req.body)
    let email = req.body.email
    let password = req.body.password
    const sql_params = [email];
    const sql = "SELECT password FROM duser WHERE email = ?";
    connection.query(sql, sql_params, function(err, results) {
        if(err) console.log(err);
        else 
        {
            console.log("dlogin select res ", results);
            if (results.length == 1) {   
            	if (results[0].password === password) {
	            	res.send({'res': true})
            	}
            	else {
            		res.send({'res': false})
            	}
            }
            else {
            	res.send({'res': false})
            }
        }
    });
})








