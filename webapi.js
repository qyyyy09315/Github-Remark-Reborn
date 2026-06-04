var webApi = {
	_server_host : 'https://promotion.devgo.top/github_remark',
    _httpGet : function(url, callback){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if ( xhr.readyState === xhr.DONE ) {
				if ( xhr.status === 200 || xhr.status === 0 ) {
					if ( xhr.response ) {
						callback( xhr.response );
					} else {
						console.warn( "[" + url + "] seems to be unreachable or file there is empty" );
                        // 接口失败降级
                        callback({success: false, data: 'no remark'});
					}
				} else {
					console.error( "Couldn't load [" + url + "] [" + xhr.status + "]" );
                    // 接口失败降级
                    callback({success: false, data: 'no remark'});
				}
			}
		};
        // 增加超时处理
        xhr.timeout = 3000;
        xhr.ontimeout = function () {
            console.warn("[" + url + "] request timeout");
            callback({success: false, data: 'no remark'});
        };
		xhr.open( "GET", url, true );
		xhr.responseType = "json"; 
		xhr.send( null );
	},
    _jsonPost : function(url, data, callback){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if ( xhr.readyState === xhr.DONE ) {
				if ( xhr.status === 200 || xhr.status === 0 ) {
					callback( xhr.response );
				} else {
					console.error( "jsonPost err [" + url + "] [" + xhr.status + "]" );
                    callback({success: false});
				}
			}
		};
        // 增加超时处理
        xhr.timeout = 3000;
        xhr.ontimeout = function () {
            console.warn("[" + url + "] request timeout");
            callback({success: false});
        };
		xhr.open( "POST", url, true );
        xhr.setRequestHeader("Content-Type", "application/json"); 
		xhr.responseType = "json"; 
		xhr.send( JSON.stringify(data) );
	}

};
webApi.updateRemark = function(userToken, username, remark, callback){
    // 确保username正确，过滤空格和特殊字符
    username = username.trim().replace(/\s+/g, '');
	var data = {'token':userToken, 'username':username, 'remark':remark};
    this._jsonPost(this._server_host+'/updateRemark', data, function(result){
        callback(result?.success || false);
    })
};
webApi.getRemark = function(userToken, username, callback){
    // 确保username正确，过滤空格和特殊字符，只取用户名部分
    username = username.trim().replace(/\s+/g, '');
    // 防止username带多余的昵称信息，优先从可能的url格式提取
    const match = /github\.com\/([^\/\s]+)/.exec(username);
    if (match) {
        username = match[1];
    }
	var url = this._server_host+'/getRemark?token='+encodeURIComponent(userToken)+'&username='+encodeURIComponent(username);
    this._httpGet(url, function(result){
		callback(result?.success ? result.data : 'no remark');
    })
};