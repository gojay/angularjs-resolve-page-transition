var url = 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api';

var logFocus = function() {
	var top = $('#logger').offset().top;
	$('body').animate({
		scrollTop: top
	}, 400);
};
var startLogger = function(message, callback) {
	clearLogger();
	logFocus();
	$('#logger .info').text(message);
	if(callback) callback();
};
var clearLogger = function(message) {
	var $logger = $('#logger');
	$('.watcher, .info, .completed, .failed', $logger)
		.map(function(i, e) {
			if ($(e).hasClass('alert')) $(e).removeClass('alert alert-success alert-error');
			$(e).html('');
		});
};

var logProgress = function(message) {
	$('#logger .watcher').append('<li>' + message + '</li>');
};
var logProgressStart = function(index, message) {
	$('#logger .watcher').append('<li id="' + index + '"><i class="icon-spinner icon-spin"></i> ' + message + '</li>');
};
var logProgressEnd = function(index, message) {
	$('#logger .watcher #' + index).addClass('text-success').text(message);
};
var logCompleted = function(message) {
	$('#logger .completed').addClass('alert alert-success').text(message);
};
var logFailed = function(message) {
	$('#logger .failed').addClass('alert alert-error').text(message);
};

// http://nurkiewicz.blogspot.com/2013/03/promises-and-deferred-objects-in-jquery.html
// http://stackoverflow.com/questions/6538470/jquery-deferred-waiting-for-multiple-ajax-requests-to-finish

var promises = [
	$.getJSON(url + '/promise/1'),
	$.getJSON(url + '/promise/2'),
	$.getJSON(url + '/promise/3'),
	$.getJSON(url + '/promise/4'),
	$.getJSON(url + '/promise/5')
];
/*
$.when.apply($, promises).done(function(e) {
	console.debug('debug', e);
	console.info(arguments);
});
*/

// 	function intervalPromise(millis, count) {
// 	    var deferred = $.Deferred();
// 	    if(count <= 0) {
// 	        deferred.reject("Negative repeat count " + count);
// 	    }
// 	    var iteration = 0;
// 	    var id = setInterval(function() {
// 	        deferred.notify(++iteration, count);
// 	        if(iteration >= count) {
// 	            clearInterval(id);
// 	            deferred.resolve();
// 	        }
// 	    }, millis);
// 	    return deferred.promise();
// 	}

// 	var notifyingPromise = intervalPromise(500, 4);

// 	notifyingPromise.
// 	    progress(function(iteration, total) {
// 	        console.debug("Completed ", iteration, "of", total);
// 	    }).
// 	    done(function() {
// 	        console.info("Done");
// 	    }).
// 	    fail(function(e) {
// 	        console.warn(e);
// 	    });

// 	function doubleAjax() {
//     	var deferred = $.Deferred();
// 	    $.getJSON(url +'/promise/1', function(res){
// 	     	deferred.notify(res);
// 	     	$.getJSON(url +'/promise/2', function(res){
// 		     	deferred.notify(res);
// 		     	$.getJSON(url +'/promise/3', function(res){
// 			     	deferred.notify(res);
// 			     	$.getJSON(url +'/promise/4', function(res){
// 				     	deferred.notify(res);
// 				     	$.getJSON(url +'/promise/5', function(res){
// 					     	deferred.resolve(res);
// 					     })
// 				     })
// 			     })
// 		    })
// 	    })
// 	    return deferred.promise();
// 	}

// 	doubleAjax().
// 	    progress(function(threeSquare) {
// 	        console.info("In the middle", threeSquare);
// 	    }).
// 	    done(function(fiveSquare) {
// 	        console.info("Done", fiveSquare);
// 	    });

// $.when(
// 	nested(),
// 	dispatch()
// ).done(function() {
// 	console.log('accepted:', arguments[0], arguments[1]);
// });
 
var n = 0;
function dispatch() {
	return $.Deferred(function(dispached) {
		$.when.apply(this, $.map(['sushi','soba','tenpura'], function(v) {
			return $.Deferred(function(dfd) {
				setTimeout(function() {
					console.log("resolve "+v);
					dfd.resolve(v);
				}, Math.random() * 1500);
			})
			.done(function(msg) {
				console.log('done:'+msg);
			});
		}))
		.done(function() {
			console.log('done all');
			dispached.resolve('dispache done');
		});
	});
}
 
function nested() {
	return $.Deferred(function(d) {
		$.when(
			nested_a(),
			nested_b()
		)
		.done(function() {
			d.resolve('nested done');
		});
	});
}
 
function nested_a() {
	return $.Deferred(function(d) {
		setTimeout(d.resolve, Math.random() * 1000);
	});	
}
function nested_b() {
	return $.Deferred(function(d) {
		setTimeout(d.resolve, Math.random() * 1000);
	});	
}

// PIPE
// http://api.jquery.com/deferred.pipe/
// http://joseoncode.com/2011/09/26/a-walkthrough-jquery-deferred-and-promise/

function getSuperheroes(hero, who){
	return $.getJSON(url + '/superheroes').pipe(function(res){
		return {
			url : res[hero], 
			who : who
		};
	});
}

function getHeroesBy(hero){
	return $.getJSON(hero.url).pipe(function(res){
		return $.getJSON(res[hero.who]);
	});
}

function getCharacters(hero, who){
	return getSuperheroes(hero, who).pipe(getHeroesBy);
}

// getCharacters('manga', 'Dragon Ball').done(function(res){
// 	console.log(res);
// });

function getSuperheroes2(hero, timeout){
	var d = $.Deferred();

	$.getJSON(url + '/superheroes')
		.pipe(function(res){
			return $.getJSON(res[hero]).pipe(function(h){
				var heros = [];
				for(var k in h) heros.push(k);
				return heros;
			});
		})
		.done(function(res){
			d.resolve(res);
		});

	return d.promise();
}

$.when(getSuperheroes2('dc'), getSuperheroes2('marvel'))
	.pipe(function(dc, marvel){
		logProgress('DC heroes : ' + dc.join(', '));
		logProgress('Marvel heroes : ' + marvel.join(', '));
		return dc.concat(marvel);
	})
	.done(function(res){
		logProgress('American heroes : ' + res.join(', '));
	});

function doPromise(url){
    var defer = $.Deferred();
    $.getJSON(url).done(function(res){
        logProgress("Step " + res.response + " finished." + JSON.stringify(res));
    	defer.resolve(parseInt(res.response));
    })
    return defer.promise();
}
// $.getJSON(url+'/promises').then(function(urls){
// 	var currentStep = doPromise(urls[0]);
//     for(var i = 1; i < urls.length; i++){
//         currentStep = currentStep.pipe(function(j){
//             return doPromise(urls[j]);
//         });
//     }
//     $.when(currentStep).done(function(res){
//         console.log("All steps done.", res);
//         logCompleted("All steps done.");
//     });
// })

// $(function(){
//     var currentStep = doPromise(0);
//     for(var i = 1; i < 5; i++){
//         currentStep = currentStep.pipe(function(j){
//             return doPromise(j+1);
//         });
//     }
//     $.when(currentStep).done(function(res){
//         console.log("All steps done.", res);
//         logCompleted("All steps done.");
//     });
// });

// http://jsfiddle.net/pxVAE/4/
/*function a() {
    var def = $.Deferred();
    $.ajax({
        url: url+'/superheroes'
    }).pipe(function(data) {
        var requests = [];
        for (i in data) {
            console.log('calling b', data[i]);
            requests.push(b(data[i]));
        }
        $.when.apply($, requests).then(function() {
            def.resolve();
        });
    });
    return def.promise();
}

function b(data) {
    var def = $.Deferred();
    var requests = [];
    for (i in data) {
        console.log('b called', data[i].name);
        requests.push($.ajax({
            url: data[i].url
        }).pipe(function(response) {
            console.log('b response', response);
            c(response);
        }));
    }
    $.when.apply($, requests).then(function() {
        def.resolve();
    });

    return def.promise();
}

function c(data) {
    var def = $.Deferred();
    var requests = [];

    for (i in data) {
        console.log('c called', data[i].name);
        requests.push($.ajax({
	            url: data[i].url,
	        	success: function(response) {
	            	console.log('c done ', response);
	        	}
	    }));
    }

    $.when.apply($, requests).then(function(response) {
        def.resolve();
    });

    return def.promise();
}

function main() {
    $.when(a()).done(function() {
        console.log('all completed');
    });
}*/


	// Makes sequential getJSON requests, passing the processed results from the 
	// previous request to the next request. seedData is optional.
	// var chainedGetJSON = function(requests, seedData) {
	//   var seed = $.Deferred(),
	//       finalPromise;

	//    	console.log('requests', requests);

	//   finalPromise = requests.reduce(function(promise, request) {
	//       console.log('<<<<<<<<<<<<<<<<<<');
	//       console.log('promise', promise);
	//       console.log('request', request);
	//       console.log('>>>>>>>>>>>>>>>>>>>');
	//     return promise.pipe(function(input) {
	//       console.log('input', input);
	//       return $.getJSON(request.url(input)).pipe(function(json) {
	//         return request.process(json, input);
	//       });
	//     });
	//   }, seed.promise());

	//   	// Start the chain 
	//   	seed.resolve(seedData);

	//   return finalPromise;
	// };

	// var thesaurusUrlForLastWord = function(words) {
	//   var word = words[words.length - 1];
	//   console.log('words', words);
	//   var url = "http://words.bighugelabs.com/api/2/2f0691be609ef56b97d1f8d5261c8bf3/" + word + "/json?callback=?";
	//   console.log('url', url);
	//   return url;
	// };

	// Make three sequential requests to the thesaurus API starting with the word "food". 
	// Each subsequent request will do a new query using the last word returned from the previous result set
	// chainedGetJSON([
	//   { 
	//     url: thesaurusUrlForLastWord,
	//     process: function(json, words) {
	//       // Return synonyms
	//       console.log('synonyms', json, words);
	//       console.log('----------------------------------------------------------------------------');
	//       $.each(words, function(i,e){ logProgress(e) });
	//       return json.noun.syn;
	//     }
	//   },
	//   {
	//     url: thesaurusUrlForLastWord,
	//     process: function(json, words) {
	//       // Add new synonyms to the end
	//       console.log('synonyms to the end', json, words.concat(json.noun.syn));
	//       console.log('----------------------------------------------------------------------------');
	//       $.each(words, function(i,e){ logProgress(e) });
	//       return words.concat(json.noun.syn);
	//     }
	//   },
	//   {
	//     url: thesaurusUrlForLastWord,
	//     process: function(json, words) {
	//       // Add the first three synonyms to the beginning
	//       console.log('the first three synonyms to the beginning', json, json.noun.syn.slice(0,3).concat(words));
	//       console.log('----------------------------------------------------------------------------');
	//       $.each(words, function(i,e){ logProgress(e) });
	//       return json.noun.syn.slice(0,3).concat(words);
	//     }
	//   }
	// ], ["food"]).then(function(words) {
	//     console.log('output', words);
	//   	$('#output').text(words.join("\n"));
	// }).done(function(words){
	//     console.log('complete', words);
	// 	alert('complete');
	// });


// http://stackoverflow.com/questions/8049041/chaining-ajax-requests-with-jquerys-deferred
// http://spin.atomicobject.com/2011/08/24/chaining-jquery-ajax-calls/
var chainedGetJSON2 = function(requests) {
	var seed = $.Deferred();

	console.log('requests', requests);

	var finalPromise = requests.reduce(function(promise, request, index) {
		console.log('<<<<<<<<<<<<<<<<<<');
		console.log('request', request);
		console.log('index', index);
		console.log('>>>>>>>>>>>>>>>>>>>');
		return promise.pipe(function() {
			var liIndex = 'item-' + index;
			logProgress(liIndex, 'requesting ' + request);
			return $.getJSON(request).pipe(function(res) {
				$('.progress #' + liIndex).html('finished ' + JSON.stringify(res));
				return res;
			});
		});
	}, seed.promise());

	// Start the chain 
	seed.resolve();

	return finalPromise;
};

var chainedGetJSON3 = function(requests) {
	var seed = $.Deferred();

	console.log('requests', requests);

	var finalPromise = requests.reduce(function(promise, request, index) {
		console.log('<<<<<<<<<<<<<<<<<<');
		console.log('request', request);
		console.log('index', index);
		console.log('>>>>>>>>>>>>>>>>>>>');
		return promise.pipe(function() {
			var liIndex = 'item-' + index;
			logProgressStart(liIndex, 'requesting ' + request.replace('.json', '...'));
			return $.post(url + '/convert/' + request).pipe(function(res) {
				var response = JSON.parse(res);
				console.log(response);
				logProgressEnd(liIndex, response.message);
				return res;
			});
		});
	}, seed.promise());

	// Start the chain 
	seed.resolve();

	return finalPromise;
};

// $.getJSON(url +'/promises').then(function(urls) {
//   	chainedGetJSON2(urls).done(function(res) {
//   		logCompleted("All completed.");
// 	})
// });

function convertPhones(){
	startLogger('Phones converting...', function(){
		$.getJSON(url +'/sources').then(function(phones){
			chainedGetJSON3(phones).done(function(res) {
		  		logCompleted("All completed.");
			})
		});
	});
}

// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/Reduce

/*[0,1,2,3,4].reduce(function(previousValue, currentValue, index, array){
	console.log('previousValue',previousValue);
	console.log('currentValue',currentValue);
	console.log('index',index);
	console.log('array',array);
  return previousValue + currentValue;
}, 20);*/

/*var flattened = [[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
	console.log('previousValue',a);
	console.log('currentValue',b);
    return a.concat(b);
});*/

/* =================== Async Control Flow =================== */

/*
 * Async is a utility module which provides straight-forward,
 * powerful functions for working with asynchronous JavaScript.
 *
 * source : https://github.com/caolan/async/
 */

/*
 * series
 *
 * Run an array of functions in series, each one running once the previous function has completed.
 * If any functions in the series pass an error to its callback,
 * no more functions are run and the callback for the series is immediately called with the value of the error.
 * Once the tasks have completed, the results are passed to the final callback as an array.
 */

function startAsyncSeries() {
	startLogger('Starting Async Series', function(){

		var timeout1 = $('input[name="emulate1"]', this.parentNode).val();
		var timeout2 = $('input[name="emulate2"]', this.parentNode).val();
		var timeout3 = $('input[name="emulate3"]', this.parentNode).val();

		async.series({
			one: function(callback) {
				setTimeout(function() {
					console.info('[series] call one');
					logProgress('call one');
					callback(null, 1);
				}, timeout1);
			},
			two: function(callback) {
				setTimeout(function() {
					console.info('[series] call two');
					logProgress('call two');
					callback(null, 2);
				}, timeout2);
			},
			three: function(callback) {
				setTimeout(function() {
					console.info('[series] call three');
					logProgress('call three');
					callback(null, 2);
				}, timeout3);
			}
		},

		function(err, results) {
			console.log('[series] completed ', results);
			logCompleted('completed, results ' + JSON.stringify(results) + '');
		});

	});
}

/*
 * parallel
 *
 * Run an array of functions in parallel, without waiting until the previous function has completed
 * If any of the functions pass an error to its callback, the main callback is immediately called with the value of the error.
 * Once the tasks have completed, the results are passed to the final callback as an array.
 */

function startAsyncParallel() {
	startLogger('Starting Async Parallel', function(){

		var timeout1 = $('input[name="emulate1"]', this.parentNode).val();
		var timeout2 = $('input[name="emulate2"]', this.parentNode).val();
		var timeout3 = $('input[name="emulate3"]', this.parentNode).val();

		async.parallel({
			one: function(callback) {
				setTimeout(function() {
					console.info('[parallel] call one');
					logProgress('call one');
					callback(null, 1);
				}, timeout1);
			},
			two: function(callback) {
				setTimeout(function() {
					console.info('[parallel] call two');
					logProgress('call two');
					callback(null, 2);
				}, timeout2);
			},
			three: function(callback) {
				setTimeout(function() {
					console.info('[parallel] call three');
					logProgress('call three');
					callback(null, 2);
				}, timeout3);
			}
		},

		function(err, results) {
			console.log('[parallel] completed ', results);
			logCompleted('completed, results ' + JSON.stringify(results) + '');
		});

	});
}

/*
 * whilst
 *
 * Repeatedly call fn, while test returns true.
 * Calls the callback when stopped, or an error occurs.
 */

function startAsyncWhilst() {
	startLogger('Starting Async Whilst', function(){

		var count = 0;
		var timeout = $('input[name="emulate"]', this.parentNode).val();
		var until = $('input[name="until"]', this.parentNode).val();

		async.whilst(

			function() {
				return count < until;
			},

			function(callback) {
				count++;
				console.info('[whilst] call ' + count);
				logProgress('call something here at ' + count);
				setTimeout(callback, timeout);
			},

			function(err) {
				console.info('[whilst] error ' + err);
				logCompleted('completed');
			}
		);

	});
}

/*
 * waterfall
 *
 * Runs an array of functions in series, each passing their results to the next in the array.
 * However, if any of the functions pass an error to the callback, the next function is not executed and the main callback is immediately called with the error.
 */

function startAsyncWaterfall() {
	startLogger('Starting Async Waterfall', function(){

		var timeout = $('input[name="emulate"]', this.parentNode).val();

		async.waterfall([

			function(callback) {
				console.info('[waterfall] start call');
				logProgress('Start calling second, send arguments <pre>' + JSON.stringify(['one', 'two']) + '</pre>');
				callback(null, 'one', 'two');
			},

			function(arg1, arg2, callback) {
				var _arguments = arguments;
				console.info('[waterfall] get arguments from first ', _arguments);
				setTimeout(function() {
					logProgress('get arguments from first <pre>' + JSON.stringify(_arguments) + '</pre>');
					setTimeout(function() {
						logProgress('Start calling third, send arguments <pre>' + JSON.stringify(['three']) + '</pre>');
						callback(null, 'three');
					}, timeout);
				}, timeout);

			},

			function(arg1, callback) {
				var _arguments = arguments;
				// arg1 now equals 'three'
				console.info('[waterfall] done, get arguments', _arguments);
				setTimeout(function() {
					logProgress('get arguments from second <pre>' + JSON.stringify(_arguments) + '</pre>');
					setTimeout(function() {
						logProgress('Start calling completed, send arguments <pre>done</pre>');
						callback(null, 'done');
					}, timeout);
				}, timeout);
			}
		], function(err, result) {
			var _arguments = arguments;
			// result now equals 'done'  
			console.info('[waterfall] completed', result);
			setTimeout(function() {
				logCompleted('completed, results ' + JSON.stringify(_arguments));
			}, timeout);
		});

	});
}

/* 
 * queue (applyEachSeries)
 *
 * Creates a queue object with the specified concurrency.
 * Tasks added to the queue will be processed in parallel (up to the concurrency limit). If all workers are in progress, the task is queued until one is available. Once a worker has completed a task, the task's callback is called.
 */

// create a queue object with concurrency 2

function startAsyncQueue() {
	startLogger('Starting Async Queue', function(){

		var concurrency = $('input[name="concurrency"]', this.parentNode).val();
		var timeout = $('input[name="emulate"]', this.parentNode).val();

		var q = async.queue(function(task, callback) {
			setTimeout(function() {
				console.log('[queue] task ' + task.name);
				logProgressStart(task.id, 'Requesting ' + task.name + ' ...');
				callback();
			}, timeout);
		}, concurrency);


		// assign a callback
		q.drain = function() {
			setTimeout(function() {
				console.log('[queue] all items have been processed');
				logCompleted('all items have been processed');
			}, timeout);
		}

		// add some items to the queue

		q.push({
			id: 'foo',
			name: 'foo'
		}, function(err) {
			setTimeout(function() {
				console.log('[queue] finished processing foo');
				logProgressEnd('foo', 'Finished processing foo');
			}, timeout);
		});
		q.push({
			id: 'bar2',
			name: 'bar2'
		}, function(err) {
			setTimeout(function() {
				console.log('[queue] finished processing bar2');
				logProgressEnd('bar2', 'Finished processing bar2');
			}, timeout);
		});

		// add some items to the queue (batch-wise)

		q.push([{
			id: 'bar3',
			name: 'baz'
		}, {
			id: 'bar3',
			name: 'bay'
		}, {
			id: 'bar3',
			name: 'bax'
		}], function(err) {
			setTimeout(function() {
				console.log('[queue] finished processing bar3');
				logProgressEnd('bar3', 'Finished processing bar3');
			}, timeout);
		});

		// add some items to the front of the queue

		q.unshift({
			id: 'bar1',
			name: 'bar1'
		}, function(err) {
			setTimeout(function() {
				console.log('[queue] finished processing bar1');
				logProgressEnd('bar1', 'Finished processing bar1');
			}, timeout);
		});

	});

}
