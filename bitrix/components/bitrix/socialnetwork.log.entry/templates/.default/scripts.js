window["__logCommentsListRedefine"] = function(ENTITY_XML_ID)
{
	if (!!window["UC"] && !!window["UC"][ENTITY_XML_ID])
	{
		window["UC"][ENTITY_XML_ID].send = function() {
			this.logID = this.nav.getAttribute("bx-sonet-nav-event-id");
			this.commentID = this.nav.getAttribute("bx-sonet-nav-comment-id");
			this.ts = this.nav.getAttribute("bx-sonet-nav-ts");
			this.bFollow = this.nav.getAttribute("bx-sonet-nav-follow");
			this.status = "busy";
			BX.addClass(this.nav, "feed-com-all-hover");
			BX.ajax({
				method: 'GET',
				url: BX.message('sonetLEGetPath') + '?' +
					BX.ajax.prepareData({
						sessid : BX.bitrix_sessid(),
						r : Math.floor(Math.random() * 1000),
						action : "get_comments",
						lang : BX.message('sonetLLangId'),
						site : BX.message('sonetLSiteId'),
						stid : BX.message('sonetLSiteTemplateId'),
						nt : BX.message('sonetLNameTemplate'),
						sl : BX.message('sonetLShowLogin'),
						dtf : BX.message('sonetLDateTimeFormat'),
						as : BX.message('sonetLAvatarSizeComment'),
						p_user : BX.message('sonetLPathToUser'),
						p_group : BX.message('sonetLPathToGroup'),
						p_dep : BX.message('sonetLPathToDepartment'),
						p_smile : BX.message('sonetLPathToSmile'),
						logid : this.logID,
						commentID : this.commentID
					}),
				dataType: 'json',
				onsuccess: BX.proxy(function(data) {
					if (!(typeof(data) == "object" && !!data) || data[0] == '*')
					{
						BX.debug(data);
					}
					else
					{
						var
							arComments = data["arComments"],
							messageList = '';
						for (var i in arComments)
						{
							var
								anchor_id = Math.floor(Math.random()*100000) + 1,
								commF = arComments[i]["EVENT_FORMATTED"],
								comm = arComments[i],
								ratingNode = (!!window["__logBuildRating"] ? window["__logBuildRating"](comm["EVENT"], commF, anchor_id) : null),
								thisId = (!!comm["EVENT"]["SOURCE_ID"] ? comm["EVENT"]["SOURCE_ID"] : comm["EVENT"] ["ID"]),
								res = {
									"ID" : thisId, // integer
									"ENTITY_XML_ID" : this.ENTITY_XML_ID, // string
									"FULL_ID" : [this.ENTITY_XML_ID, thisId],
									"NEW" : (this.bFollow && parseInt(comm["LOG_DATE_TS"]) > this.ts &&
										comm["EVENT"]["USER_ID"] != BX.message('sonetLCurrentUserID') ? "Y" : "N"), //"Y" | "N"
									"APPROVED" : "Y", //"Y" | "N"
									"POST_TIMESTAMP" : comm["LOG_DATE_TS"],
									"POST_TIME" : comm["LOG_TIME_FORMAT"],
									"POST_DATE" : comm["LOG_DATETIME_FORMAT"],
									"~POST_MESSAGE_TEXT" : commF["MESSAGE"],
									"POST_MESSAGE_TEXT" : commF["FULL_MESSAGE_CUT"],
									"URL" : {
										"LINK" : comm["URL"]
									},
									"AUTHOR" : {
										"ID" : comm["EVENT"]["USER_ID"],
										"NAME" : comm["CREATED_BY"]["FORMATTED"],
										"URL" : comm["CREATED_BY"]["URL"],
										"AVATAR" : comm["AVATAR_SRC"] },
									"BEFORE_ACTIONS" : (!!ratingNode ? ratingNode : ''),
									"AFTER" : commF["UF"]
								};
							messageList += fcParseTemplate({messageFields : res});
						}
					}
					this.build({
						status : true,
						navigation : '',
						messageList : messageList});
				}, this),
				onfailure: BX.delegate(function(data){ this.status = "ready"; BX.debug(data); }, this)
			});
			return false;
		}
	}
}
window["__logBuildRating"] = function(comm, commFormat, anchor_id) {
	var ratingNode = '';
		anchor_id = (!!anchor_id ? anchor_id : (Math.floor(Math.random()*100000) + 1));
	if ( BX.message("sonetLShowRating") == 'Y' &&
		!!comm["RATING_TYPE_ID"] > 0 && comm["RATING_ENTITY_ID"] > 0 &&
		(BX.message("sonetLRatingType") == "like" && !!window["RatingLike"] || BX.message("sonetLRatingType") == "standart_text" && !!window["Rating"]))
	{
		if (BX.message("sonetLRatingType") == "like")
		{
			var
				you_like_class = (comm["RATING_USER_VOTE_VALUE"] > 0) ? " bx-you-like" : "",
				you_like_text = (comm["RATING_USER_VOTE_VALUE"] > 0) ? BX.message("sonetLTextLikeN") : BX.message("sonetLTextLikeY"),
				vote_text = null;
			if (!!commFormat["ALLOW_VOTE"] &&
				!!commFormat["ALLOW_VOTE"]["RESULT"])
				vote_text = BX.create('span', {
					props: {
						'className': 'bx-ilike-text'
					},
					html: you_like_text
				});

			ratingNode = BX.create('span', {
				attrs : {
					id : 'sonet-rating-' + comm["RATING_TYPE_ID"] + '-' + comm["RATING_ENTITY_ID"] + '-' + anchor_id
				},
				props: {
					'className': 'sonet-log-comment-like rating_vote_text'
				},
				children: [
					BX.create('span', {
						props: {
							'className': 'ilike-light'
						},
						children: [
							BX.create('span', {
								props: {
									'id': 'bx-ilike-button-' + comm["RATING_TYPE_ID"] + '-' + comm["RATING_ENTITY_ID"] + '-' + anchor_id,
									'className': 'bx-ilike-button'
								},
								children: [
									BX.create('span', {
										props: {
											'className': 'bx-ilike-right-wrap' + you_like_class
										},
										children: [
											BX.create('span', {
												props: {
													'className': 'bx-ilike-right'
												},
												html: comm["RATING_TOTAL_POSITIVE_VOTES"]
											})
										]
									}),
									BX.create('span', {
										props: {
											'className': 'bx-ilike-left-wrap'
										},
										children: [
											vote_text
										]
									})
								]
							}),
							BX.create('span', {
								props: {
									'id': 'bx-ilike-popup-cont-' + comm["RATING_TYPE_ID"] + '-' + comm["RATING_ENTITY_ID"] + '-' + anchor_id,
									'className': 'bx-ilike-wrap-block'
								},
								style: {
									'display': 'none'
								},
								children: [
									BX.create('span', {
										props: {
											'className': 'bx-ilike-popup'
										},
										children: [
											BX.create('span', {
												props: {
													'className': 'bx-ilike-wait'
												}
											})
										]
									})
								]
							})
						]
					})
				]
			});
		}
		else if (BX.message("sonetLRatingType") == "standart_text")
		{
			ratingNode = BX.create('span', {
				attrs : {
					id : 'sonet-rating-' + comm["RATING_TYPE_ID"] + '-' + comm["RATING_ENTITY_ID"] + '-' + anchor_id
				},
				props: {
					'className': 'sonet-log-comment-like rating_vote_text'
				},
				children: [
					BX.create('span', {
						props: {
							'className': 'bx-rating' + (!commFormat["ALLOW_VOTE"]['RESULT'] ? ' bx-rating-disabled' : '') + (comm["RATING_USER_VOTE_VALUE"] != 0 ? ' bx-rating-active' : ''),
							'id': 'bx-rating-' + comm["RATING_TYPE_ID"] + '-' + comm["RATING_ENTITY_ID"] + '-' + anchor_id,
							'title': (!commFormat["ALLOW_VOTE"]['RESULT'] ? commFormat["ERROR_MSG"] : '')
						},
						children: [
							BX.create('span', {
								props: {
									'className': 'bx-rating-absolute'
								},
								children: [
									BX.create('span', {
										props: {
											'className': 'bx-rating-question'
										},
										html: (!commFormat["ALLOW_VOTE"]['RESULT'] ? BX.message("sonetLTextDenied") : BX.message("sonetLTextAvailable"))
									}),
									BX.create('span', {
										props: {
											'className': 'bx-rating-yes ' +  (comm["RATING_USER_VOTE_VALUE"] > 0 ? '  bx-rating-yes-active' : ''),
											'title': (comm["RATING_USER_VOTE_VALUE"] > 0 ? BX.message("sonetLTextCancel") : BX.message("sonetLTextPlus"))
										},
										children: [
											BX.create('a', {
												props: {
													'className': 'bx-rating-yes-count',
													'href': '#like'
												},
												html: ""+parseInt(comm["RATING_TOTAL_POSITIVE_VOTES"])
											}),
											BX.create('a', {
												props: {
													'className': 'bx-rating-yes-text',
													'href': '#like'
												},
												html: BX.message("sonetLTextRatingY")
											})
										]
									}),
									BX.create('span', {
										props: {
											'className': 'bx-rating-separator'
										},
										html: '/'
									}),
									BX.create('span', {
										props: {
											'className': 'bx-rating-no ' +  (comm["RATING_USER_VOTE_VALUE"] < 0 ? '  bx-rating-no-active' : ''),
											'title': (comm["RATING_USER_VOTE_VALUE"] < 0 ? BX.message("sonetLTextCancel") : BX.message("sonetLTextMinus"))
										},
										children: [
											BX.create('a', {
												props: {
													'className': 'bx-rating-no-count',
													'href': '#dislike'
												},
												html: ""+parseInt(comm["RATING_TOTAL_NEGATIVE_VOTES"])
											}),
											BX.create('a', {
												props: {
													'className': 'bx-rating-no-text',
													'href': '#dislike'
												},
												html: BX.message("sonetLTextRatingN")
											})
										]
									})
								]
							})
						]
					}),
					BX.create('span', {
						props: {
							'id': 'bx-rating-popup-cont-' + comm["RATING_TYPE_ID"] + '-' + comm["RATING_ENTITY_ID"] + '-' + anchor_id + '-plus'
						},
						style: {
							'display': 'none'
						},
						children: [
							BX.create('span', {
								props: {
									'className': 'bx-ilike-popup  bx-rating-popup'
								},
								children: [
									BX.create('span', {
										props: {
											'className': 'bx-ilike-wait'
										}
									})
								]
							})
						]
					}),
					BX.create('span', {
						props: {
							'id': 'bx-rating-popup-cont-' + comm["RATING_TYPE_ID"] + '-' + comm["RATING_ENTITY_ID"] + '-' + anchor_id + '-minus'
						},
						style: {
							'display': 'none'
						},
						children: [
							BX.create('span', {
								props: {
									'className': 'bx-ilike-popup  bx-rating-popup'
								},
								children: [
									BX.create('span', {
										props: {
											'className': 'bx-ilike-wait'
										}
									})
								]
							})
						]
					})
				]
			});
		}
	}
	if (!!ratingNode)
	{
		ratingNode = BX.create('span', { children : [ ratingNode ] } );
		ratingNode = ratingNode.innerHTML +
			'<script>window["#OBJ#"].Set("#ID#", "#RATING_TYPE_ID#", #RATING_ENTITY_ID#, "#ALLOW_VOTE#", BX.message("sonetLCurrentUserID"), #TEMPLATE#, "light", BX.message("sonetLPathToUser"));</script>'.
			replace("#OBJ#", (BX.message("sonetLRatingType") == "like" ? "RatingLike" : "Rating")).
			replace("#ID#", comm["RATING_TYPE_ID"] + '-' + comm["RATING_ENTITY_ID"] + '-' + anchor_id).
			replace("#RATING_TYPE_ID#", comm["RATING_TYPE_ID"]).
			replace("#RATING_ENTITY_ID#", comm["RATING_ENTITY_ID"]).
			replace("#ALLOW_VOTE#", (!!commFormat["ALLOW_VOTE"] && !!commFormat["ALLOW_VOTE"]['RESULT'] ? 'Y' : 'N')).
			replace("#TEMPLATE#", (BX.message("sonetLRatingType") == "like" ?
				'{LIKE_Y:BX.message("sonetLTextLikeN"),LIKE_N:BX.message("sonetLTextLikeY"),LIKE_D:BX.message("sonetLTextLikeD")}' :
				'{PLUS:BX.message("sonetLTextPlus"),MINUS:BX.message("sonetLTextMinus"),CANCEL:BX.message("sonetLTextCancel")}'));

	}
	return ratingNode;
}
window["__logShowCommentForm"] = function(xmlId)
{
	if (!!window["UC"][xmlId])
		window["UC"][xmlId].reply();
}

var waitTimeout = null;
var waitDiv = null;
var	waitPopup = null;
var waitTime = 500;


function __logEventExpand(node)
{
	if (BX(node))
	{
		BX(node).style.display = "none";

		var tmpNode = BX.findParent(BX(node), {'tag': 'div', 'className': 'feed-post-text-block'});
		if (tmpNode)
		{
			var contentContrainer = BX.findChild(tmpNode, {'tag': 'div', 'className': 'feed-post-text-block-inner'}, true);
			var contentNode = BX.findChild(tmpNode, {'tag': 'div', 'className': 'feed-post-text-block-inner-inner'}, true);

			if (contentContrainer && contentNode)
			{
				fxStart = 300;
				fxFinish = contentNode.offsetHeight;


				(new BX.fx({
					time: 1.0 * (contentNode.offsetHeight - fxStart) / (1200 - fxStart),
					step: 0.05,
					type: 'linear',
					start: fxStart,
					finish: fxFinish,
					callback: BX.delegate(__logEventExpandSetHeight, contentContrainer),
					callback_complete: BX.delegate(function()
					{
						contentContrainer.style.maxHeight = 'none';
					})
				})).start();
			}
		}
	}
}

function __logCommentExpand(node)
{
	if (!BX.type.isDomNode(node))
		node = BX.proxy_context;

	if (BX(node))
	{
		var topContrainer = BX.findParent(BX(node), {'tag': 'div', 'className': 'feed-com-text'});
		if (topContrainer)
		{
			BX.remove(node);
			var contentContrainer = BX.findChild(topContrainer, {'tag': 'div', 'className': 'feed-com-text-inner'}, true);
			var contentNode = BX.findChild(topContrainer, {'tag': 'div', 'className': 'feed-com-text-inner-inner'}, true);

			if (contentNode && contentContrainer)
			{
				fxStart = 200;
				fxFinish = contentNode.offsetHeight;

				var time = 1.0 * (fxFinish - fxStart) / (2000 - fxStart);
				if(time < 0.3)
					time = 0.3;
				if(time > 0.8)
					time = 0.8;

				(new BX.fx({
					time: time,
					step: 0.05,
					type: 'linear',
					start: fxStart,
					finish: fxFinish,
					callback: BX.delegate(__logEventExpandSetHeight, contentContrainer),
					callback_complete: BX.delegate(function()
					{
						contentContrainer.style.maxHeight = 'none';
					})
				})).start();
			}
		}
	}
}

function __logEventExpandSetHeight(height)
{
	this.style.maxHeight = height + 'px';
}

function __logShowHiddenDestination(log_id, created_by_id, bindElement)
{

	var sonetLXmlHttpSet6 = new XMLHttpRequest();

	sonetLXmlHttpSet6.open("POST", BX.message('sonetLESetPath'), true);
	sonetLXmlHttpSet6.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	sonetLXmlHttpSet6.onreadystatechange = function()
	{
		if(sonetLXmlHttpSet6.readyState == 4)
		{
			if(sonetLXmlHttpSet6.status == 200)
			{
				var data = LBlock.DataParser(sonetLXmlHttpSet6.responseText);
				if (typeof(data) == "object")
				{
					if (data[0] == '*')
					{
						if (sonetLErrorDiv != null)
						{
							sonetLErrorDiv.style.display = "block";
							sonetLErrorDiv.innerHTML = sonetLXmlHttpSet6.responseText;
						}
						return;
					}
					sonetLXmlHttpSet6.abort();
					var arDestinations = data["arDestinations"];
					
					if (typeof (arDestinations) == "object")
					{
						if (BX(bindElement))
						{
							var cont = bindElement.parentNode;
							cont.removeChild(bindElement);
							var url = '';

							for (var i = 0; i < arDestinations.length; i++)
							{
								if (typeof (arDestinations[i]['TITLE']) != 'undefined' && arDestinations[i]['TITLE'].length > 0)
								{
									cont.appendChild(BX.create('SPAN', {
										html: ',&nbsp;'
									}));

									if (typeof (arDestinations[i]['URL']) != 'undefined' && arDestinations[i]['URL'].length > 0)
										cont.appendChild(BX.create('A', {
											props: {
												className: 'feed-add-post-destination-new',
												'href': arDestinations[i]['URL']
											},
											html: arDestinations[i]['TITLE']
										}));
									else
										cont.appendChild(BX.create('SPAN', {
											props: {
												className: 'feed-add-post-destination-new'
											},
											html: arDestinations[i]['TITLE']
										}));
								}
							}

							if (
								data["iDestinationsHidden"] != 'undefined'
								&& parseInt(data["iDestinationsHidden"]) > 0
							)
							{
								data["iDestinationsHidden"] = parseInt(data["iDestinationsHidden"]);
								if (
									(data["iDestinationsHidden"] % 100) > 10
									&& (data["iDestinationsHidden"] % 100) < 20
								)
									var suffix = 5;
								else
									var suffix = data["iDestinationsHidden"] % 10;

								cont.appendChild(BX.create('SPAN', {
									html: '&nbsp;' + BX.message('sonetLDestinationHidden' + suffix).replace("#COUNT#", data["iDestinationsHidden"])
								}));
							}
						}
					}
				}
			}
			else
			{
				// error!
			}
		}
	}

	sonetLXmlHttpSet6.send("r=" + Math.floor(Math.random() * 1000)
		+ "&" + BX.message('sonetLSessid')
		+ "&site=" + BX.util.urlencode(BX.message('SITE_ID'))
		+ "&nt=" + BX.util.urlencode(BX.message('sonetLNameTemplate'))
		+ "&log_id=" + encodeURIComponent(log_id)
		+ (created_by_id ? "&created_by_id=" + encodeURIComponent(created_by_id) : "")
		+ "&p_user=" + BX.util.urlencode(BX.message('sonetLPathToUser'))
		+ "&p_group=" + BX.util.urlencode(BX.message('sonetLPathToGroup'))
		+ "&p_dep=" + BX.util.urlencode(BX.message('sonetLPathToDepartment'))
		+ "&dlim=" + BX.util.urlencode(BX.message('sonetLDestinationLimit'))
		+ "&action=get_more_destination"
	);

}

function __logSetFollow(log_id)
{
	var strFollowOld = (BX("log_entry_follow_" + log_id, true).getAttribute("data-follow") == "Y" ? "Y" : "N");
	var strFollowNew = (strFollowOld == "Y" ? "N" : "Y");	

	if (BX("log_entry_follow_" + log_id, true))
	{
		BX.findChild(BX("log_entry_follow_" + log_id, true), { tagName: 'a' }).innerHTML = BX.message('sonetLFollow' + strFollowNew);
		BX("log_entry_follow_" + log_id, true).setAttribute("data-follow", strFollowNew);
	}
				
	BX.ajax({
		url: BX.message('sonetLSetPath'),
		method: 'POST',
		dataType: 'json',
		data: {
			"log_id": log_id,
			"action": "change_follow",
			"follow": strFollowNew,
			"sessid": BX.bitrix_sessid(),
			"site": BX.message('sonetLSiteId')
		},
		onsuccess: function(data) {
			if (
				data["SUCCESS"] != "Y"
				&& BX("log_entry_follow_" + log_id, true)
			)
			{
				BX.findChild(BX("log_entry_follow_" + log_id, true), { tagName: 'a' }).innerHTML = BX.message('sonetLFollow' + strFollowOld);
				BX("log_entry_follow_" + log_id, true).setAttribute("data-follow", strFollowOld);
			}
		},
		onfailure: function(data) {
			if (BX("log_entry_follow_" +log_id, true))
			{
				BX.findChild(BX("log_entry_follow_" + log_id, true), { tagName: 'a' }).innerHTML = BX.message('sonetLFollow' + strFollowOld);
				BX("log_entry_follow_" + log_id, true).setAttribute("data-follow", strFollowOld);
			}		
		}
	});
	return false;
}