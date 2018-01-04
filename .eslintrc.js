module.exports = {
    'env': {
        'browser': true,
        'es6': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'sourceType': 'module'
    },
    'globals': {
         'moment': true,
         '$': true,
         'toastr': true,
         'require': true,
         'module': true,
         'harlan': true,
         'mocha': true,
         'EnjoyHint': true,
         'numeral': true,
         'createjs': true,
         'componentHandler': true,
         'bipbop': true,
         'Mustache': true,
         'SQL': true,
         'jQuery': true,
         'BIPBOP_FREE': true,
         'JSZip': true,
         'OAuth': true,
         'Buffer': true,
         'fbq': true,
         'googleAnalytics': true,
         'natural': true,
         'google': true,
         'cordova': true,
         'Camera': true,
         'vis': true,
         'Connection': true,
         'FileUploadOptions': true,
         'FileTransfer': true
    },
    'rules': {
        'no-console': 0,
        'no-useless-escape': 0,
        'no-unused-vars': 0,
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ]
    }
};
