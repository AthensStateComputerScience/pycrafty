// FILE: index.js
// AUTHORS: Richie Burch, Nathan Robertson
// PURPOSE: Detects various GET and POST requests and performs appropriate actions on them.


const fs = require('fs');
const os = require('os');
const express = require('express');
const validator = require('express-validator');
let router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('/public/index.html');
});

// FROM: https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };



// Writes requested code to python file in mcpipy directory.
// If the input field is empty a default file called "script.py" is used.
// Only Windows file paths are supported.
// https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file
// Validator/Sanitizer documentation: https://express-validator.github.io/docs/index.html
const ILLEGAL_FILENAME_CHARS = /[:\\|?*]+/;
const MAX_FILE_LENGTH = 100;
const WINDOWS = "win32";
const MACOS = "darwin";
const ERROR_STATUS_CODE = 422;
const SUCCESS_STATUS_CODE = 200;
router.post(
    '/copy_text',
    [
        validator.check('fileName')
            // SANITIZERS
            .trim()
            .escape()
            .stripLow()
            .customSanitizer((value, {}) => value.replace(/(\.[\w]*)$/, ""))
            .customSanitizer((value, {}) => {
                return String(value).length === 0 ? "script" : value;
            })

            // VALIDATORS
            .custom((_, {}) => os.platform() === WINDOWS || os.platform() === MACOS)
            .withMessage("This page only supports Windows based operating systems OR macOS.")
            .isLength({min: 1, max:MAX_FILE_LENGTH})
            .withMessage("File names must be 100 characters or less.")
            .custom((value, {}) => value.match(ILLEGAL_FILENAME_CHARS) === null)
            .withMessage("?, :, \\, |, and * cannot be used in file names.")
    ],
    asyncMiddleware(function (req, res, next) {
            let errors = validator.validationResult(req);
            let file_path = getFilePath(req.body.fileName);
            let file_path_mac = getFilePathMac(req.body.fileName);

            if (!errors.isEmpty()) {
                return res.status(ERROR_STATUS_CODE).json({errors: errors.array()});
            }
            else if (os.platform() === MACOS) {

              fs.writeFile(file_path_mac, req.body.codeArea, function (err) {
                if (!err) {
                    res.status(SUCCESS_STATUS_CODE).json({file_name: String(req.body.fileName) + ".py"});
                } else {
                    res.status(ERROR_STATUS_CODE).json({"errors": [{msg: "Could not write file"}]});
                }
            });
            }
            else {
            fs.writeFile(file_path, req.body.codeArea, function (err) {
                if (!err) {
                    res.status(SUCCESS_STATUS_CODE).json({file_name: String(req.body.fileName) + ".py"});
                } else {
                    res.status(ERROR_STATUS_CODE).json({"errors": [{msg: "Could not write file"}]});
                }
            });
          }

        })
);

router.post(
    '/submit-form',
    asyncMiddleware(function (req, res, next) {
		console.log("Got to router.post");

		con.connect(function(err) {
			if (err) throw err;
				console.log("Connected!");
			var sql = "INSERT INTO users_t (uname, fname, lname, age, experience) VALUES ('test2', 'Newtest', 'Works', '1', 'none')";
			con.query(sql, function (err, result) {
				if (err) throw err;
				console.log("1 record inserted");
			});
		});
		
    })
);

/**
 * getFilePath: Returns correct file path for .minecraft/mcpipy folder
 * https://minecraft.gamepedia.com/.minecraft
 */
function getFilePath(fileName) {
    return os.userInfo().homedir + "\\AppData\\Roaming\\.minecraft\\mcpipy\\" + fileName + ".py";
}

function getFilePathMac(fileName) {
    return os.userInfo().homedir + "//Library//Application Support//minecraft//mcpipy//" + fileName + ".py";
}

module.exports = router;
