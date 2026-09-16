fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'cLo_oDy'
description 'Nopixel V Inspired Map'
version '1.0.0'

shared_script 'config.lua'

client_scripts {
    'client/map.lua',
    'client/main.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/css/*.css',
    'html/js/*.js',
    'html/vendor/*',
    'html/fonts/*',
    'html/img/**/*'
}

exports {
    'open',
    'close',
    'isOpen',
    'addMapLocation',
    'removeMapLocation'
}

