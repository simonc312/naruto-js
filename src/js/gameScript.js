//require("babel-polyfill");
let strings = require("./strings.js");
let gameOverDialog = require("./gameover.js");
let model = require("./model.js");
let styleModels = require("./styleModels.js");
// Global constants:
var PLAYGROUND_WIDTH    = 1000;
var PLAYGROUND_HEIGHT    = 500;
var REFRESH_RATE        = 30;
var PLAYGROUND_CALLBACK_RATE = 1000; //milliseconds
var BASE_PATH = strings.paths.base;
var SPRITE_PATH = strings.paths.sprite;

//Constants for the gameplay
var stageSpeed = 3;

var smallCloudSpeed        = 1; //pixels per frame
    
var mediumCloudSpeed       = 3; //pixels per frame
    
var bigCloudSpeed          = 5; //pixels per frame

//MODES
var ATTACK = 0;
var DAMAGE = 1;
var BLOCK = 2;
var DEATH = 3;
//Constants for damage counter
var DEATH_BLADE_DAMAGE = 40;
var BLADE_DAMAGE = 20;
var KUNAI_DAMAGE = 10;
var BLAST_DAMAGE = 30;

var ninjaCollisionDamage = 10;
var smartNinjaCollisionDamage = 25;
var bossNinjaCollisionDamage = 100;

var NINJA_KILL_POINTS = 10;
var SMART_NINJA_KILL_POINTS = 25;
var BOSS_KILL_POINTS = 10;

var KUNAI_TYPE = 1;
var DEATH_BLADE_TYPE = 2;
var COIN_TYPE = 3;
var HEART_TYPE = 4;
var SCROLL_TYPE = 5;
var LIFE_TYPE = 6;

var PLAYER_SPEED = 12;
var DEATH_BLADE_SPEED = 10;
var KUNAI_SPEED = 20;
var COIN_SPEEDX = 16;
var HEART_SPEEDX = 10;
var chakraHealth = 100; 
var shieldHealth = 100;
var ninjaShieldHealth = 20;
var smartNinjaShieldHealth = 40;
var bossNinjaShieldHealth = 100;

var enemyHeight = 73;
var enemyWidth = 80;
var playerHeight = 73;
var playerWidth = 81;

var meterHeight = 14;
var meterWidth = shieldHealth;

var avatarHeight = 101;
var avatarWidth = 81; 

var scoreWidth = 100;
var scoreHeight = 50;

var coinWidth = 33;
var coinHeight = 43;

var heartWidth= 43;
var heartHeight= 43;

var scrollWidth= 34;
var scrollHeight= 29;

var ramenWidth=26;
var ramenHeight=27;

var coinValue = 10;  
var heartHealth = 25;
var scrollChakra = 25;
var playerLives = 3;
//record the time when first holding down the attack button. Used to see if held long enough for a death Blade 
var timeHeld = 0;
var chargeSfx = 1; //will hold the charge sfx object to remove after key up on charging 

// Global animation holder
var currentGame;
var playerAnimation = new Array();
var enemies = new Array(3); // There are three kind of enemies in the game
var missile = new Array();
var item = new Array(); //For special items and health and coins etc
var sfx = new Array(); //Special Effects like HitAnimation and Damage Animation 

var playerHit = false;
var grace = false;
var prevHealth = -1;
var prevChakra = -1;   

var onePlayerMode = false;
var team;
var team2;
var avatarIdArray = new Array();
var gameReady = false;
var LEFT = styleModels.leftSide.styleClass;
var RIGHT = styleModels.rightSide.styleClass;
var side = LEFT;
// --------------------------------------------------------------------
// --                      the main declaration:                     --
// --------------------------------------------------------------------

$(function(){

  // this sets the id of the loading bar:
  $.loadCallback(function(percent){
            $("#loadingBar").width(400*percent);
      });

	  
	  
function addAllAvatars(side){
	$("#boxes.mini"+side).each(function(){
		if($(this).hasClass("first") || $(this).hasClass("second") || $(this).hasClass("third")) 
			avatarIdArray.push($(this).find('img').attr('id'));
	});
	if(side == ".left")
		avatarIdArray.unshift("naruto");
	else
		avatarIdArray.unshift("sasuke");
	}	  

function replaceOrAddAvatar(selector, avatarSrc, avatarId, numImgs){
if($(selector).find('img').length < numImgs){
	$(selector).prepend('<img id='+avatarId+' src= "' + avatarSrc + '"/>');
	}
else	{
	$(selector).find('img').attr('src',avatarSrc)
	$(selector).find('img').attr('id',avatarId);
	}

}

//set img of the 123 slots to selected avatar imgSrc and set up the order of team
function addTeamAvatar(avatarId, avatarSrc){
var div = "#boxes.mini"+side;
var choose = "#boxes.choose"+side;
var place = team.tryAddPlayer(avatarId);
var playableSrc = avatarSrc.replace("Avatar1","Playable");
if(place == 1){
	replaceOrAddAvatar(div+".first",avatarSrc,avatarId,1);
}

else if(place == 2){
	replaceOrAddAvatar(div+".second",avatarSrc,avatarId,1);
}

else{
	replaceOrAddAvatar(div+".third",avatarSrc,avatarId,1);
	$(strings.button.id).text(strings.button.startGame);
	gameReady = true;
}
replaceOrAddAvatar(choose,playableSrc,avatarId,1);
}

function addAvatarSelectionClickListener(node){
	if($(node).hasClass('avatar')){
		$(node).css('cursor','pointer');
		//change image icon onclick
		$(node).click(function(){
			var img = $(node).find('img');
			var src = img.attr('src');
			var id = img.attr('id');
			addTeamAvatar(id,src);
		});
	}
}
	  
function enableSingleSelection(){
$(strings.mode.onePlayer.id).fadeOut("slow");
$(strings.mode.twoPlayers.id).fadeOut("slow");
$(strings.button.id).text(strings.button.chooseTeam);
$(".choose").each(function(){
	$(this).css('cursor','pointer');
	$(this).addClass(styleModels.side.styleClasses);
	$(this).click(function() {
		$(strings.button.id).text(strings.button.chooseOrder);
		team = new Team();
		if($(this).hasClass('left')) {
      onSideSelected(styleModels.leftSide, 
                     styleModels.rightSide);
		} else {
			onSideSelected(styleModels.rightSide, 
                     styleModels.leftSide);
		}
    $(".choose").each(function(){$(this).unbind('click');});
		});
});
}

function onSideSelected(selectedSide, otherSide) {
  hideSide(otherSide.styleClass);
  $(".choose" + otherSide.styleClass).css('cursor','default');

  side = selectedSide.styleClass;
  $(side).each( function() {
    $(this).addClass(selectedSide.selectedStyleClasses);
    addAvatarSelectionClickListener($(this));
  });
}	

function hideSide(side) {  
  shiftSide(side);
  $(side).animate({"opacity": 0 }, "slow");
}

function shiftSide(side) {
  let properties;
  if (side == LEFT) {
    properties = {
      "paddingRight" : "20%", 
      "margin-left" : "-20%"
    };
  } else {
    properties = {"paddingLeft": "20%"};
  }
  $("#welcomeScreen").animate(properties,"slow");
}

function enableVersusSelection(){}	  
	  
function onePlayerMode(){
onePlayerMode = true; 
enableSingleSelection();

}

function twoPlayerMode(){
onePlayerMode = false; 
enableVersusSelection();
}
	  
function selectModeMouseClickListener(){
	$(strings.mode.onePlayer.id).click(function(){onePlayerMode();});
	$(strings.mode.twoPlayers.id).click(function(){twoPlayerMode();});
}	  
	  
function updateScore(score){
  currentGame.updateScore(score);
  $(".score").text(getScore().toString());
  $(".score").animate({fontSize: '50px'},"slow");
  $(".score").animate({fontSize: '25px'},"slow");
}

function getScore() {
  if (currentGame != null) {
    return currentGame.getScore();
  } else {
    return -1; 
  }
}

function animateLevel(newLevel) {
  let levelText = $(".level");
  levelText.text("LEVEL " + newLevel.toString());
  levelText.animate({fontSize: '80px', opacity: 1, left: '+=50'},2000);
  levelText.animate({fontSize: '75px', opacity: 0, left: '-=50'},"fast");
}	  

function resetScore(){
$(".score").text("0");}

function resetBarsAndAvatar(){
	$("#meter span[class ^='health']").each(function(){
		$(this).animate({width: shieldHealth});
		}
	);

	$("#meter span[class ^='chakra']").each(function(){
		$(this).animate({width: chakraHealth});
		}
	);

	animateAvatar(playerAvatar1);
	prevChakra = -1;
	prevHealth = -1;

}

function animateChakraBar(){
	var curChakra = $("#player")[0].player.chakra;
	$("#meter span[class ^='chakra']").each(function() {
		if(curChakra != prevChakra){
			if(curChakra >= 0){
				$(this).animate({width: curChakra});
				if(curChakra <= curChakra/4){
					$(this).id = "red";
				}
			prevChakra = curChakra;
			}	
			else{
				$(this).animate({width: 0});
				$(this).id = "blue";
				prevChakra = -1;
			}
		}
	});
}

function animateHealthBar(){
	var curHealth = $("#player")[0].player.shield; 

	$("#meter span[class ^='health']").each(function() {
		if(curHealth != prevHealth){
			prevHealth = curHealth;
			if(curHealth > 0){
				$(this).id = "green";
				$(this).animate({width: curHealth});
				if( (curHealth > shieldHealth/4) && (curHealth <= shieldHealth/1.5)){
					animateAvatar(playerAvatar2);
					$(this).id = "orange";
				}
				else if(curHealth <= shieldHealth/4){
					$(this).id = "red";
					animateAvatar(playerAvatar3);
				}	
			}
		else{
			$(this).animate({width: '0'});
			prevHealth = -1;
			resetBarsAndAvatar();
			}
		}
	});

}

function animateAvatar(avatar){
$("#playerAvatar").setAnimation(avatar);
}

function animateBarsAndAvatar(){
animateHealthBar();
animateChakraBar();
};

function addLifeItem(xpos, ypos){
var itemName = "item1_"+Math.ceil(Math.random()*1000);
			  $("#items").addSprite(itemName, {animation: item["life"],
			  posx: xpos, posy: ypos,
			  width: ramenWidth, height: ramenHeight});
			  $("#"+itemName).addClass("items");
			  $("#"+itemName)[0].items = new Item($("#"+itemName),LIFE_TYPE,100,HEART_SPEEDX);
}

// takes in the sfx animation the position to be created and the proper width and height of sprite
function addSfx(newAnimation, xpos, ypos, offsetx, offsety, w, h){
	var sfxName = "sfx1_"+Math.ceil(Math.random()*1000);
	if(newAnimation == sfx["chargeSfx"]){
		$("#player").addSprite(sfxName, {animation: newAnimation,
			  posx: xpos+offsetx, posy: ypos+offsety,
			  width: w, height: h});
		return $("#"+sfxName);
	}
	else
	//remove the sfx soon after created don't want it hanging around
	if(newAnimation != sfx["chargeSfx"]){
	$("#sfx").addSprite(sfxName, {animation: newAnimation,
			  posx: xpos+offsetx, posy: ypos+offsety,
			  width: w, height: h});
	setTimeout(function(){removeSfx($("#"+sfxName))}, 300);
	}
	//case of the charging chakra sfx keep playing until release
}

function removeSfx(node){
		$(node)[0].remove();
	}
	
function animateChargeSfx(){
	var i = 0;
	setInterval(function(){
  	if(chargeSfx != 1){
  			chargeSfx.setAnimation(i);
  			i =(i+1)%2;
  	}
  }, REFRESH_RATE-5);	

}
	
function addEnemyMissile(node){
	var enemyposx = parseInt(node.x());
	var enemyposy = parseInt(node.y());
	var name = "enemiesMissile_"+Math.ceil(Math.random()*1000);
	$("#enemiesMissileLayer").addSprite(name,{animation: missile["enemies"],
    posx: enemyposx -30, posy: enemyposy + 20, width: 25,height: 17});
	$("#"+name).addClass("enemiesMissiles");
}



function animateEnemy(node, mode){
if(mode == ATTACK){
	if($(node)[0].enemy instanceof BossNinja){ 
		node.setAnimation(enemies[2]["attack"]);
		}
	else if($(node)[0].enemy instanceof SmartNinja){
		node.setAnimation(enemies[1]["attack"]);
		}
	else {
		node.setAnimation(enemies[0]["attack"]);
	}
	}
	
	else if(mode == DEATH){
		
		if($(node)[0].enemy instanceof BossNinja){ 
			addSfx(sfx["sfx3"],$(node).x(),$(node).y(),20,-35,100, 48);
			node.setAnimation(enemies[2]["explode"]);
		}
		else if($(node)[0].enemy instanceof SmartNinja){
			node.setAnimation(enemies[1]["explode"]);
		}
		else {
		node.setAnimation(enemies[0]["explode"]);
		}
	}
}

function updateEnemies(){
  $(".enemy").each(function(){
        this.enemy.update($("#player"));
        var posx = parseInt($(this).x());
        if((posx + enemyWidth) < 0){
         $(this).remove();
          return;
        }
        //Test for collisions
			  if(grace){ 
          return; 
        }
				var collided = $(this).collision("#playerBody, #player");
        if (collided.length <= 0) { 
          return; 
        }

				if(this.enemy.damage($("#player")[0].player.shield)){
					var addScore = 0;
					if(this.enemy instanceof BossNinja){
            let boss = this;
						$(this).setAnimation(enemies[2]["damage"], animateEnemy(boss.enemy.node, DEATH));  
            console.log("boss defeated by player collision");
            boss.enemy.onDestroy();
						$(this).w(enemyWidth);
						addScore = BOSS_KILL_POINTS;
						
						
					} 
					else if(this.enemy instanceof SmartNinja) {
						$(this).setAnimation(enemies[1]["explode"], function(node){$(node).remove();});
						$(this).w(enemyWidth);
						addScore = SMART_NINJA_KILL_POINTS;
						
					} 
					else {
						$(this).setAnimation(enemies[0]["explode"], function(node){$(node).remove();});
						$(this).w(enemyWidth);
						addScore = NINJA_KILL_POINTS;
					}
				updateScore(addScore);	
				$(this).removeClass("enemy");	
				}
				else{
					addSfx(sfx["sfx1"],$(this).x(),$(this).y(),20,-35,55, 41);
				}
				
          
				//The player has been hit!
				
                if($("#player")[0].player.damage(this.enemy.collisionDamage)){
				  explodePlayer($("#playerBody"));
                }
				else{
					$("#playerBody").setAnimation(playerAnimation["damage"]);
				
					addSfx(sfx["sfx2"],$("#player").x(),$("#player").y(),20,-35, 70, 42);
					animateHealthBar();}
				
				
				
              
            });
			}

function updateMissiles(){
	
	//Update player missiles 
	 $(".playerMissiles").each(function(){
		
		this.playerMissiles.update();
          if($(this).x() > PLAYGROUND_WIDTH){
            $(this).remove();
            return;
          }
        
        //Test for player missile collisions ITS BUGGY AS FUCK 
        var collided = $(this).collision("#actors,.enemy");
        if(collided.length <= 0){ 
          return; //missed
        }
        //An enemy has been hit!
			if (this.playerMissiles.type == DEATH_BLADE_TYPE) {
				this.playerMissiles.update();
				$(this).setAnimation(missile["playerexplode"], function(node){$(node).remove();});
			} else {
				$(this).setAnimation(missile["enemiesexplode"], function(node){$(node).remove();}); 
			}
			var damageAmount = this.playerMissiles.damage;	 
			$(this).removeClass("playerMissiles"); 
            collided.each(function(){
            if(this.enemy.damage(damageAmount)){
				if (this.enemy instanceof BossNinja) {
          let boss = this;
					updateScore(BOSS_KILL_POINTS);
					var x = $(this).x();
					var y = $(this).y();
					$(this).setAnimation(enemies[2]["explode"], 
            function(node){
              console.log("player missile killed boss");
              boss.enemy.onDestroy();
            });
					$(this).w(enemyWidth);
					// reward with 1up icon
					addLifeItem(x,y);
				} 
				else if(this.enemy instanceof SmartNinja) {
					updateScore(SMART_NINJA_KILL_POINTS);
					$(this).setAnimation(enemies[1]["explode"], node => this.enemy.onDestroy());
					$(this).w(enemyWidth);
				} 
				else {
					updateScore(NINJA_KILL_POINTS);
					$(this).setAnimation(enemies[0]["explode"], node => this.enemy.onDestroy());
					$(this).w(enemyWidth);
				}
				$(this).removeClass("enemy");
			}
			else {
				addSfx(sfx["sfx1"],$(this).x(),$(this).y(),20,-35,55, 41);
				if(this.enemy instanceof BossNinja){
					$(this).setAnimation(enemies[2]["damage"]);
					$(this).w(enemyWidth);
				} 
				else if(this.enemy instanceof SmartNinja) {
					$(this).setAnimation(enemies[1]["damage"]);
					$(this).w(enemyWidth);
				} 
				else {
					$(this).setAnimation(enemies[0]["damage"]);
					$(this).w(enemyWidth);
				}
				  
			}
				 
            				 
          });
		 
		  
	
	});
	
	//update enemy Missiles 
	$(".enemiesMissiles").each(function(){
		
          var posx = parseInt($(this).x());
          if(posx < 0){
            $(this).remove();
            return;
          }
          $(this).x(posx-KUNAI_SPEED);
		 
          //Test for collisions
		if(!grace){
			var collided = $(this).collision("#player,#playerBody");
			if(collided.length > 0){
				//The player has been hit!
				collided.each(function(){
				if($("#player")[0].player.damage(KUNAI_DAMAGE))
					explodePlayer($("#playerBody"));
				else{
					addSfx(sfx["sfx2"],$("#player").x(),$("#player").y(),20,-35,70, 42);
					$("#playerBody").setAnimation(playerAnimation["damage"]);
					animateHealthBar();
				}
				})
				$(this).setAnimation(missile["enemiesexplode"], function(node){$(node).remove();});
				$(this).removeClass("enemiesMissiles");
			}
		}	
		});

}

		function updateItems(){
		$(".items").each(function(){
			this.items.update();
			var x = this.items.type; //temp variables 
			var y = this.items.health;
			if($(this).x() < 0){
            $(this).remove();
            return;
			}
			 //Test for collisions
			var collided = $(this).collision("#player,#playerBody");
			if(collided.length > 0){
				//The player gets item
				collided.each(function(){
				if(x == HEART_TYPE){
					$("#player")[0].player.healHealth(y);
					animateHealthBar();
				}
				else if(x == SCROLL_TYPE){
					$("#player")[0].player.healChakra(y);
					animateChakraBar();
				}
				else if(x == LIFE_TYPE){
					$("#player")[0].player.healHealth(y);
					$("#player")[0].player.healChakra(y);
					animateBarsAndAvatar();
					$("#player")[0].player.replay +=1;
				}
			  else{
			  updateScore(coinValue);
			  } 
            })
            $(this).removeClass("items");
			$(this).remove();
          }
		});
		};

//Player dies trigger animation change 
		function explodePlayer(playerBodyNode){
          playerBodyNode.setAnimation(playerAnimation["die"]);
          playerHit = true;
		  animateHealthBar();
        }

    function shareToFacebook() {
      console.log("share high score and chosen team and ranking to facebook");
    }
		
		// Function to restart the game:
    function restartgame(){
      window.location.reload();
    };


    // Animations declaration: 
    // The background:    
    
		//avatars
		var playerAvatar1;
		var playerAvatar2;
		var playerAvatar3;
        // background 
		var background1 = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "smallCloud1.png"});
        var background2 = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "smallCloud1.png"});
        var background3 = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "mediumCloud3.png"});
        var background4 = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "mediumCloud5.png"});
        var background5 = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "largeCloud1.png"});
        var background6 = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "mediumCloud1.png"});
		var backgroundStage = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "LakeStage.png"});
		
		var cloudAnimation = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "cloud.png"});
		
		///  List of enemies animations :
        // 1st kind of enemy:
        enemies[0] = new Array(); 
        enemies[0]["idle"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "enemyIdle.png", numberOfFrame: 5,
           delta: 80, rate: 60, type: $.gameQuery.ANIMATION_ONCE});
		       enemies[0]["attack"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "enemyAttack.png", numberOfFrame: 5,
           delta: 80, rate: 60, numberOfFrame : 4, distance: 81, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI});
		   	    enemies[0]["damage"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "enemyDamage.png",
           delta: 80, rate: 60, numberOfFrame : 2, distance: 81, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI});
        enemies[0]["explode"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "enemyDeath.png",
           delta: 80, rate: 30, numberOfFrame : 3, distance: 81, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI | $.gameQuery.ANIMATION_CALLBACK});

        // 2nd kind of enemy:
        enemies[1] = new Array();
        enemies[1]["idle"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "enemyIdle.png", numberOfFrame: 5,
           delta: 80, rate: 60, type: $.gameQuery.ANIMATION_ONCE});
		       enemies[1]["attack"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "enemyAttack.png", numberOfFrame: 5,
           delta: 80, rate: 60, numberOfFrame : 4, distance: 81, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI});
		   	    enemies[1]["damage"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "enemyDamage.png",
           delta: 80, rate: 60, numberOfFrame : 2, distance: 81, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI});
        enemies[1]["explode"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "enemyDeath.png",
           delta: 80, rate: 30, numberOfFrame : 3, distance: 81, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI | $.gameQuery.ANIMATION_CALLBACK});
		
        // 3rd kind of enemy:
        enemies[2] = new Array();
        enemies[2]["idle"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "tobiIdle.png", numberOfFrame: 5,
           delta: 52, rate: 60, type: $.gameQuery.ANIMATION_ONCE});
		       enemies[2]["attack"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "tobiAttackMulti.png", numberOfFrame: 5,
           delta: 80, rate: 60, distance: 98, type: $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_HORIZONTAL| $.gameQuery.ANIMATION_MULTI});
		   	    enemies[2]["damage"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "tobiDeathMulti.png", numberOfFrame: 2,
           delta: 80, rate: 60, distance: 98, type: $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_MULTI |$.gameQuery.ANIMATION_REVERSE});
        enemies[2]["explode"]	= new $.gameQuery.Animation({imageURL: SPRITE_PATH + "tobiDeathMulti.png", numberOfFrame: 5,
           delta: 80, rate: 30, distance: 98, type: $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI | $.gameQuery.ANIMATION_CALLBACK});

        // Weapon missile:
        missile["player"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "deathblade.png", numberOfFrame: 6,
           delta: 10, rate: 90, type: $.gameQuery.ANIMATION_ONCE});
        missile["enemies"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "kunai.png", numberOfFrame: 6,
           delta: 15, rate: 90, type: $.gameQuery.ANIMATION_ONCE});
        missile["playerexplode"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "deathbladehit.png",
           numberOfFrame: 8, delta: 23, rate: 90,
           type: $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
        missile["enemiesexplode"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "kunaihit.png",
           numberOfFrame: 6, delta: 15, rate: 90,
           type: $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
		
		// Item sprites 
		
		item["coin"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "coin.png", numberOfFrame: 6,
			delta: 10, rate: 90, type: $.gameQuery.ANIMATION_ONCE});
		item["heart"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "heart.png", numberOfFrame: 6,
			delta: 10, rate: 90, type: $.gameQuery.ANIMATION_ONCE});
		item["chakraScroll"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "chakraScroll.png", numberOfFrame: 6,
			delta: 10, rate: 90, type: $.gameQuery.ANIMATION_ONCE});
		item["life"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "1up.png", numberOfFrame: 6,
			delta: 10, rate: 90, type: $.gameQuery.ANIMATION_ONCE});
		sfx["sfx1"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "gah.png", numberOfFrame: 6,
			delta: 10, rate: 90, type: $.gameQuery.ANIMATION_ONCE});
		sfx["sfx2"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "doka.png", numberOfFrame: 6,
			delta: 10, rate: 90, type: $.gameQuery.ANIMATION_ONCE});
		sfx["sfx3"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "surprise.png", numberOfFrame: 6,
			delta: 10, rate: 90, type: $.gameQuery.ANIMATION_ONCE});
		sfx["damageSfx"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "damageMulti.png", numberOfFrame: 4,
			delta: 10, rate: 90, distance: 36, type: $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI});
		sfx["explosionSfx"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "explosionMulti.png", numberOfFrame: 7,
			delta: 10, rate: 90, distance: 36, type: $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI});
		sfx["chargeSfx"] = new $.gameQuery.Animation({imageURL: SPRITE_PATH + "chargeAnimation.png", numberOfFrame: 2,
			delta: 10, rate: 30, distance: 93.5, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_VERTICAL | $.gameQuery.ANIMATION_MULTI});	
		
		
			
			

// Player naruto animations:
        
		function setUpPlayerAnimation(playerName){
		
			var spritesString = SPRITE_PATH +playerName;
		
			playerAvatar1 = new $.gameQuery.Animation({imageURL: spritesString+"Avatar1.png"});
			playerAvatar2 = new $.gameQuery.Animation({imageURL: spritesString+"Avatar2.png"});
			playerAvatar3 = new $.gameQuery.Animation({imageURL: spritesString+"Avatar3.png"});
		
		playerAnimation["idle"] = 	new $.gameQuery.Animation ({imageURL : spritesString+"Idle.png"});
		playerAnimation["damage"] =	new $.gameQuery.Animation ({imageURL : spritesString+"Damage.png",
		 numberOfFrame : 6, delta : 40, rate : 60,
                type : $.gameQuery.ANIMATION_ONCE});
        playerAnimation["die"] =	new $.gameQuery.Animation ({imageURL : spritesString+"DeathMulti.png",
		numberOfFrame : 4, delta : 82, rate : 60, distance: 82,
                type : $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI});
        playerAnimation["up"] = 	new $.gameQuery.Animation ({imageURL : spritesString+"Crouch.png",
                numberOfFrame : 6, delta : 40, rate : 60,
                type : $.gameQuery.ANIMATION_ONCE});
        playerAnimation["down"] = 	new $.gameQuery.Animation ({imageURL : spritesString+"Crouch.png",
                numberOfFrame : 6, delta : 40, rate : 60,
                type : $.gameQuery.ANIMATION_ONCE});
        playerAnimation["boost"] = 	new $.gameQuery.Animation ({imageURL : spritesString+"Boost.png" ,
                numberOfFrame : 6, delta : 40, rate : 60,
                type : $.gameQuery.ANIMATION_ONCE});
		playerAnimation["backward"] =	new $.gameQuery.Animation ({imageURL : spritesString+"Backward.png",
		 numberOfFrame : 6, delta : 40, rate : 60,
                type : $.gameQuery.ANIMATION_ONCE});
		playerAnimation["attack"] =	new $.gameQuery.Animation ({imageURL : spritesString+"AttackMulti.png",
		 numberOfFrame : 5, delta : 82, rate : 60, distance: 92,
                type : $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_MULTI});
		playerAnimation["charge"] =	new $.gameQuery.Animation ({imageURL : spritesString+"Charge.png",
		 numberOfFrame : 6, delta : 40, rate : 60,
                type : $.gameQuery.ANIMATION_ONCE});
		}
		
		//this is where the keybinding occurs
        $(document).keydown(function(e){
			switch(e.keyCode){
				case 75: //this is attack! (k)
					timeHeld = (new Date()).getTime();
					$("#playerBody").setAnimation (playerAnimation["attack"]);
					break;  
			}			
		
			if(timeHeld == 0){
				switch(e.keyCode){  
					case 65: //this is left! (a)
						$("#playerBody").setAnimation (playerAnimation["backward"]);
						break;
					case 87: //this is up! (w)
						$("#playerBody").setAnimation (playerAnimation["up"]);
						break;
					case 68: //this is right (d)
						$("#playerBody").setAnimation (playerAnimation["boost"]);
						break;
					case 83: //this is down! (s)
						$("#playerBody").setAnimation (playerAnimation["down"]);
						break;
					case 76: //charge 
						$("#playerBody").setAnimation(playerAnimation["charge"]);
						if(chargeSfx == 1){
						chargeSfx = addSfx(sfx["chargeSfx"],$("#playerBody").x(),$("#playerBody").y(),-10,0,94,69);
						//animateChargeSfx();
						}
						if(new Date().getTime()%10 == 0){
							$("#player")[0].player.restoreChakra();
							animateChakraBar();
						}
						break;
				}
			}
        });
        //this is where the keybinding occurs
        $(document).keyup(function(e){
			if(timeHeld == 0){
				switch(e.keyCode){
					case 65: //this is left! (a)
						$("#playerBody").setAnimation (playerAnimation["idle"]);
						break;
					case 87: //this is up! (w)
						$("#playerBody").setAnimation (playerAnimation["idle"]);
						break;
					case 68: //this is right (d)
						$("#playerBody").setAnimation (playerAnimation["idle"]);
						break;
					case 83: //this is down! (s)
						$("#playerBody").setAnimation (playerAnimation["idle"]);
						break;
					case 76: //charge 
						$("#playerBody").setAnimation (playerAnimation["idle"]);
						removeSfx(chargeSfx);
						chargeSfx = 1;
						break;
				}
			}
			switch(e.keyCode){
				case 13: // enter key to start the game 
						//initialize the start button
					if(gameReady){
					addAllAvatars(side);
					var playerName = avatarIdArray.shift();
					setUpPlayerAnimation(playerName);
					
					initializeGame();
					
					$.playground().startGame(function(){
					$("#welcomeMusic").animate({volume: 0}, 3000, function(){$("#welcomeMusic")[0].pause()});
					$("#fightingMusic").animate({volume: 1}, 3000, function(){$("#fightingMusic")[0].play()});
					$("#welcomeScreen").fadeOut("slow");      
					animateLevel(1); //todo update level after each boss
					});
					}
					break;
				case 80: //pause the game (p)
					$.playground().pauseGame();
					$("#fightingMusic").animate({volume: 0}, "slow", function(){$("#fightingMusic")[0].pause()});
					$("#welcomeMusic").animate({volume: 1}, "slow", function(){$("#welcomeMusic")[0].play()});
					$("#welcomeScreen").fadeIn("fast","swing", function(){$("#welcomeScreen").style.display = 'block'}); 
					break;
				case 79: //unpause the game (o)
					$.playground().resumeGame();
					$("#welcomeMusic").animate({volume: 0}, "slow", function(){$("#welcomeMusic")[0].pause()});
					$("#fightingMusic").animate({volume: 1}, "slow", function(){$("#fightingMusic")[0].play()});
					//include a function to remove the pause screen
					$("#welcomeScreen").fadeOut("fast") 
					break;
				case 75: //this is attack! (k)
					$("#playerBody").setAnimation(0);		
					// condition that you are not under grace period so you can't damage enemies either
					if(!grace){  
						var playerposx = parseInt($("#player").x());
						var playerposy = parseInt($("#player").y());
						var name = "playerMissile_"+Math.ceil(Math.random()*1000);
						var time = (new Date()).getTime() - timeHeld;
						if((new Date()).getTime() - timeHeld > 30){
							if($("#player")[0].player.chakraDamage(KUNAI_DAMAGE)){
								$("#playerMissileLayer").addSprite(name, {animation: missile["enemies"],
								                                          posx: playerposx + 30, 
                                                          posy: playerposy + 14, 
                                                          width: 25, 
                                                          height: 17});
								$("#"+name).addClass("playerMissiles");
								$("#"+name)[0].playerMissiles = new Missile($("#"+name),
                                                            KUNAI_TYPE,
                                                            KUNAI_DAMAGE,
                                                            KUNAI_SPEED);
								$("#"+name).rotate(180);
							}
						}  
						else{
							if($("#player")[0].player.chakraDamage(DEATH_BLADE_DAMAGE)){
								$("#playerMissileLayer").addSprite(name,{animation: missile["player"],
								posx: playerposx + 50, posy: playerposy + 14, width: 34, height: 36});
								$("#"+name).addClass("playerMissiles");
								$("#"+name)[0].playerMissiles = new Missile($("#"+name), 
                                                            DEATH_BLADE_TYPE,
                                                            DEATH_BLADE_DAMAGE,
                                                            DEATH_BLADE_SPEED);
								$("#"+name).rotate(10);
							}
						}
					animateChakraBar();
					}
			   		timeHeld = 0;
					break;
			}
        });

	function Team(){
		this.playerOrderArray = new Array();
		
		this.getCurrentPlayer = function(){
			return this.playerOrderArray[0];
		}
		
		this.tryAddPlayer = function(player){
			if(this.playerOrderArray.length < 3){
				return this.addPlayer(player);
			}
			else
				{
				this.removePlayer();
				return this.addPlayer(player);
				}
			}
		
		this.addPlayer = function(player){
				return this.playerOrderArray.push(player);
			}
		
		this.removePlayer = function(){
			return this.playerOrderArray.pop();}

		
	}
		
		
		function Player(node){
	
			this.node = $(node);  
			this.replay = playerLives;
			this.shield = shieldHealth;
			this.chakra = chakraHealth;
			this.respawnTime = -1;
			
			//decrease chakra after attacking 
			this.chakraDamage = function(damageAmount){
				if(this.chakra - damageAmount > 0){
					this.chakra -= damageAmount;
					return true
				}
				return false
			}
			
			this.restoreChakra = function(){
			if(this.chakra < chakraHealth)
				this.chakra += 5;
			}
	
	
			// Function damage 
			this.damage = function(damageAmount){
				if(!grace){
					this.shield -= damageAmount;
					if (this.shield <= 0)
						return true;
				}
				return false;
			};
			
			this.healHealth = function(healAmount){
				if(!grace){
					if(this.shield < shieldHealth)
						this.shield = Math.min(this.shield+healAmount,shieldHealth);
						}
			}
			
			this.healChakra = function(healAmount){
				if(!grace){
					if(this.chakra < chakraHealth)
						this.chakra = Math.min(this.chakra+healAmount,chakraHealth);
						}
			}
	
	
			this.respawn = function(){
				this.replay--;
				if(this.replay==0)
					return true;
				grace=true;
				this.shield = shieldHealth;
				this.chakra = chakraHealth;
				this.respawnTime = (new Date()).getTime();
				//next character
				//setUpPlayerAnimation(avatarIdArray.shift());
				$(this.node).fadeTo(3,0.25);
				// Why does setting the animation here cause gameOver?
				//$("#playerBody").setAnimation(playAnimation["idle"]);
				return false;
			};
	
			this.update = function(){
				if((this.respawnTime > 0) && ((new Date()).getTime() - this.respawnTime  > 3000)){
					grace = false;
					$(this.node).fadeTo(0,1);
					this.respawnTime = -1;
				}
			};
		return true; 
	
		}
		
		function Missile(node, type, damage, speedx){
			this.node = $(node);
			this.type = type;
			this.damage = damage;
			this.speedx = speedx;
			this.speedy = 0;
		
			this.update = function(){
				this.updateX();
				this.updateY();
			}
			this.updateY = function(){
				this.node.y(parseInt(this.node.y()) + this.speedy);
			};
			this.updateX = function(){
				this.node.x(parseInt(this.node.x()) + this.speedx);
			};
		}
		
		function Item(node, type, health, speedx){
			this.node = $(node);
			this.type = type;
			this.health = health;
			this.speedx = speedx;
			this.speedy = 0;
		
			this.update = function(){
				this.updateX();
				this.updateY();
			}
			this.updateY = function(){
				this.node.y(parseInt(this.node.y()) - this.speedy);
			};
			this.updateX = function(){
				this.node.x(parseInt(this.node.x()) - this.speedx);
			};
		}
	
		class Enemy {
      constructor(node) {
        this.collisionDamage = ninjaCollisionDamage;
        this.shield = ninjaShieldHealth;
        this.speedx = -5;
        this.speedy = 0;
        this.node = $(node); 
      }
		
		//deals damage to enemy 
			damage(damageAmount) {
				this.shield -= damageAmount; 
				if(this.shield <= 0){
					return true;
				}
				return false;	
			}
			
			
			update(playerNode) {
				this.updateX(playerNode);
				this.updateY(playerNode);
        if (Math.random() >= 0.95 && this.collisionDamage >= smartNinjaCollisionDamage) {
					addEnemyMissile(this.node);
					animateEnemy(this.node, ATTACK);
        }
              
			};
		
			updateY(playerNode) {
				var newpos = parseInt(this.node.y()) + this.speedy;
				this.node.y(newpos);
				};
			
      updateX(playerNode) {
				var newpos = parseInt(this.node.x()) + this.speedx;
				this.node.x(newpos);
			};
      
      onDestroy() {
        this.node.remove();
      }
			
		};
		
		//enemy type 1
		class Ninja extends Enemy {
        constructor(node) {
          super(node);
		      this.collisionDamage = ninjaCollisionDamage;
        }

        updateY(playerNode) {
          var pos = parseInt(this.node.y());
          if (pos > (PLAYGROUND_HEIGHT - 50)) {
            this.node.y((pos - 2));
          }
        }
		}
		
		//enemy type 2
		class SmartNinja extends Enemy {
      constructor(node) {
        super(node);
        this.collisionDamage = smartNinjaCollisionDamage;
        this.shield = smartNinjaShieldHealth;
        this.speedy = 2;
        this.speedx = -10;
        this.alignmentOffset = 2;
        this.playerYPrevPos = 0;
      }

      updateX(playerNode) {
        var newpos = parseInt(this.node.x()) + this.speedx;
        this.node.x(newpos);
      }

      updateY(playerNode) {
        if ((this.node.y() != $(playerNode)[0].gameQuery.posy)) {
         if ((this.node[0].gameQuery.posy+this.alignmentOffset) > $(playerNode)[0].gameQuery.posy) {
            var newpos = parseInt(this.node.y())-this.speedy;
            this.node.y(newpos);
          } 
          else if ((this.node[0].gameQuery.posy+this.alignmentOffset) < $(playerNode)[0].gameQuery.posy) {
            var newpos = parseInt(this.node.y())+this.speedy;
            this.node.y(newpos);
          }
        }
        this.playerYPrevPos = $(playerNode)[0].gameQuery.posy;
      }
    }
		
		//enemy type 3
		//should include a chance of invincibility when tobi becomes see through 
		class BossNinja extends SmartNinja {
      constructor (node, onDestroy) {
        super(node);
        this.collisionDamage = bossNinjaCollisionDamage;
        this.shield = bossNinjaShieldHealth;
        this.speedx = -1;
        this.alignmentOffset = 2;
        this.moveForward = true;
        this.onBossDestroy = onDestroy;
      }

      updateX(playerNode) {
        var pos = parseInt(this.node.x());
        if(this.moveForward & pos > (PLAYGROUND_WIDTH - 300)){
          this.node.x((pos+this.speedx));
        }
        else{
          this.moveForward = false;
          if (pos < PLAYGROUND_WIDTH - 50) {
            this.node.x(parseInt(this.node.x()) - this.speedx);
          } else{
            this.moveForward = true;
          }
        }
      }

      onDestroy() {
        super.onDestroy();
        this.onBossDestroy();
      }
    }
    // Initialize the game:
		
		function addHealthBar() {
  		var span = document.createElement("span");
  		span.width = '0%';
  		span.className = 'health';
  		span.id = 'green';
  		$("#meter")[0].appendChild(span);
		}
		
		function addChakraBar() {
  		var span2 = document.createElement("span");
  		span2.width = '0%';
  		span2.className = 'chakra';
  		span2.id = 'blue';
  		$("#meter")[0].appendChild(span2);
		}
		
		function addScoreText() {
		  let div = document.createElement("div");
  		div.className = "score";
  		$("#score")[0].appendChild(div);
  		var text = document.createTextNode("0");
  		$(".score")[0].appendChild(text);
  		//$(".score").css({'font-family': 'SilkScreen', 'font-size': '25px'});
		}
		
		function addAvatar(){
		  $("#avatar").addSprite("playerAvatar", 
        {animation: playerAvatar1,
        width: avatarWidth, 
        height: avatarHeight});
		}
		
		function addLevelText(initialLevel) {
		let level = document.createElement("div");
		level.className = "level";
		$("#text")[0].appendChild(level);
		level.appendChild(document.createTextNode("LEVEL " + initialLevel));
		}
		
		function setPlayerClass(){
		$("#player")[0].player = new Player($("#player")[0]);
		}
		
		function startMusic(){
      let welcomeMusic = $("#welcomeMusic");
      welcomeMusic[0].volume = 0;
		  welcomeMusic[0].play();
		  welcomeMusic.animate({volume: 1.0}, 3000);
		}
		
		
		function animateBoxes(){
			$("#welcomeScreen > #boxes").each(function() {
				// todo hide boxes 
        //$(this).css({'animation': 'fadeIn 2s ease 1s 1', '-webkit-animation': 'fadeIn 2s ease 1s 1'});
			});  
      $("#welcomeScreen").removeAttr("hidden");
		}		
			$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, keyTracker: true})
		function initializePlayground(){	$.playground()
		.addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
		.addGroup("actors", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
		.addGroup("items", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
		.addGroup ("player", {posx : PLAYGROUND_WIDTH/3, posy : PLAYGROUND_HEIGHT/2,
            width : playerWidth, height : playerHeight})
			.addSprite("cloud",{animation: cloudAnimation, posx: 0, posy: 0, width: 81, height: 73})
      .addSprite ("playerBody",{animation : playerAnimation["idle"], posx : 0, posy : 0, width : playerWidth, height : playerHeight}).end()
		.addGroup("playerMissileLayer",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
    .addGroup("enemiesMissileLayer",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
		.addGroup("avatar",{posy: PLAYGROUND_HEIGHT - avatarHeight -10, width: avatarWidth, height: avatarHeight}).end()
		.addGroup("meter",{posx: avatarWidth, posy: PLAYGROUND_HEIGHT - 4*meterHeight, width: meterWidth, height: meterHeight}).end()
		.addGroup("score",{posx: scoreWidth, posy: scoreHeight, width: scoreWidth, height: scoreHeight}).end()
		.addGroup("text", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
		.addGroup("sfx", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end();
		}
		
		
		function initializeGame() {
      currentGame = new model.game();
  		initializePlayground();
  		initializeBackground();
  		initializeCallbacks();
  		addHealthBar();
  		addChakraBar();
  		addScoreText();
  		addLevelText(1);
  		addAvatar();
  		setPlayerClass();
  		startMusic();
		}  

		animateBoxes();
		selectModeMouseClickListener();
		  
    // Initialize the background
    
	function initializeBackground(){
	$("#background")
		.addSprite("backgroundStage1", {animation: backgroundStage,
            width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT,
            posx: 0,
			posy: 0})
		.addSprite("backgroundStage2", {animation: backgroundStage,
            width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT,
            posx: PLAYGROUND_WIDTH,
			posy: 0})	
        .addSprite("background1", {animation: background1, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT/4.2})
        .addSprite("background2", {animation: background2,
            width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT,
            posx: PLAYGROUND_WIDTH, posy: PLAYGROUND_HEIGHT / 3.8})
        .addSprite("background3", {animation: background3,
            width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT,
			posy: PLAYGROUND_HEIGHT / 6})
        .addSprite("background4", {animation: background4,
            width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT,
            posx: PLAYGROUND_WIDTH,
			posy: PLAYGROUND_HEIGHT / 3}
			)
        .addSprite("background5", {animation: background5,
            width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT,
			posy: PLAYGROUND_HEIGHT/5})
        .addSprite("background6", {animation: background6,
            width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT,
            posx: PLAYGROUND_WIDTH,
			posy: PLAYGROUND_HEIGHT / 4});
    
    }
  
	function initializeCallbacks(){
    //This is for the background animation
    $.playground().registerCallback(function(){
    //Offset all the pane:
           var newPos = (parseInt($("#background1").x()) - smallCloudSpeed - PLAYGROUND_WIDTH)
                                  % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
          $("#background1").x(newPos);

          newPos = (parseInt($("#background2").x()) - smallCloudSpeed - PLAYGROUND_WIDTH)
                             % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
          $("#background2").x(newPos);

          newPos = (parseInt($("#background3").x()) - mediumCloudSpeed - PLAYGROUND_WIDTH)
                             % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
          $("#background3").x(newPos);

          newPos = (parseInt($("#background4").x()) - mediumCloudSpeed - PLAYGROUND_WIDTH)
                             % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
          $("#background4").x(newPos);

          newPos = (parseInt($("#background5").x()) - bigCloudSpeed - PLAYGROUND_WIDTH)
                             % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
          $("#background5").x(newPos);

          newPos = (parseInt($("#background6").x()) - bigCloudSpeed - PLAYGROUND_WIDTH)
                             % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
          $("#background6").x(newPos);
		  
		  newPos = (parseInt($("#backgroundStage1").x()) - stageSpeed - PLAYGROUND_WIDTH)
                             % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
          $("#backgroundStage1").x(newPos);
		  
		  newPos = (parseInt($("#backgroundStage2").x()) - stageSpeed - PLAYGROUND_WIDTH)
                             % (-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
          $("#backgroundStage2").x(newPos);
		  

    }, REFRESH_RATE);
	
	
	//This function manage the creation of the enemies and items
  $.playground().registerCallback(function(){
    if (currentGame.isGameOver() || currentGame.isBossMode()) {
      return;
    }

		var rand = Math.random();
    
    if (rand < 0.5) {
        var name = "enemy1_"+Math.ceil(Math.random()*1000);
			  var itemName = "item1_"+Math.ceil(Math.random()*1000);
			  $("#items").addSprite(itemName, {animation: item["coin"],
			  posx: PLAYGROUND_WIDTH-50, posy: Math.random()*PLAYGROUND_HEIGHT,
			  width: coinWidth, height: coinHeight});
			  $("#"+itemName).addClass("items");
			  $("#"+itemName)[0].items = new Item($("#"+itemName),COIN_TYPE,0,COIN_SPEEDX);
              $("#actors").addSprite(name, {animation: enemies[0]["idle"], 
                  posx: PLAYGROUND_WIDTH-50, posy: Math.random()*PLAYGROUND_HEIGHT,
                  width: enemyWidth, height: enemyHeight});
        $("#"+name).addClass("enemy");
        $("#"+name)[0].enemy = new Ninja($("#"+name));
    } else if (rand >= 0.5 & rand < 0.7){
				 var itemName = "item1_"+Math.ceil(Math.random()*1000);
			  $("#items").addSprite(itemName, {animation: item["heart"],
			  posx: PLAYGROUND_WIDTH-50, posy: Math.random()*PLAYGROUND_HEIGHT,
			  width: heartWidth, height: heartHeight});
			  $("#"+itemName).addClass("items");
			  $("#"+itemName)[0].items = new Item($("#"+itemName),HEART_TYPE,heartHealth,HEART_SPEEDX);
			  
        var name = "enemy1_"+Math.ceil(Math.random()*1000);
        $("#actors").addSprite(name, {animation: enemies[1]["idle"],
            posx: PLAYGROUND_WIDTH-70, posy: Math.random()*PLAYGROUND_HEIGHT,
            width: enemyWidth, height: enemyHeight});
        $("#"+name).addClass("enemy");
        $("#"+name)[0].enemy = new SmartNinja($("#"+name));
    } else if(rand > 0.7 & rand < 0.95){
	
		   var itemName = "item1_"+Math.ceil(Math.random()*1000);
		   $("#items").addSprite(itemName, {animation: item["chakraScroll"],
		   posx: PLAYGROUND_WIDTH-50, posy: Math.random()*PLAYGROUND_HEIGHT,
		   width: scrollWidth, height: scrollHeight});
		   $("#"+itemName).addClass("items");
		   $("#"+itemName)[0].items = new Item($("#"+itemName),SCROLL_TYPE,scrollChakra,HEART_SPEEDX);
    }

		else if(rand >= 0.95){
      currentGame.setBossMode(true);
      const bossName = "enemy1_"+Math.ceil(Math.random()*1000);
      $("#actors").addSprite(bossName, {animation: enemies[2]["idle"],
          posx: PLAYGROUND_WIDTH-80, posy: Math.random()*PLAYGROUND_HEIGHT,
          width: enemyWidth, height: enemyHeight});
      $("#"+bossName).addClass("enemy");
      $("#"+bossName)[0].enemy = new BossNinja($("#"+bossName), 
                                              () => {console.log("bossMode ended"); 
                                                      currentGame.setBossMode(false);});
    }
    
          
    }, PLAYGROUND_CALLBACK_RATE); 
		
		
	//This callback contains most of the enemy logic	
		$.playground().registerCallback(function(){
      if (currentGame.isGameOver()) {
        return; 
      }
			updateItems();
			updateMissiles();
      //Update the movement of the enemies
		  updateEnemies();
    }, REFRESH_RATE);
				
				
		// this is the function that control most of the game logic 
          $.playground().registerCallback(function(){
          if (currentGame.isGameOver()) { 
            return;
          }
          //Update the movement of the Naruto:
          if(playerHit){
            var posy = parseInt($("#player").y())+PLAYER_SPEED;
            var posx = parseInt($("#player").x())-PLAYER_SPEED;
            if(posy > PLAYGROUND_HEIGHT){
              //Does the player did get out of the screen?
              if ($("#player")[0].player.respawn()) {
                currentGame.setGameOver(true);
                let rootContainer = "#playground";
                $(rootContainer).append('<div style="position: absolute; ... >');
                $("#actors,#playerMissileLayer,#enemiesMissileLayer, #meter, #avatar, .score, .items, .level").fadeTo(1000,0);
                $("#background").fadeTo(5000,0, () => $(rootContainer).clearAll(true));
                
                gameOverDialog.show(rootContainer, getScore(), shareToFacebook, restartgame);
              } else {
                $("#explosion").remove();
                $("#player").children().show();
                $("#player").y(PLAYGROUND_HEIGHT / 2);
                $("#player").x(PLAYGROUND_WIDTH / 3);
                resetBarsAndAvatar();
                playerHit = false;
              }
            } else {
              $("#player").y(posy);
              $("#player").x(posx);
            }
          } else {
            $("#player")[0].player.update();
            if(jQuery.gameQuery.keyTracker[65]){ //this is left! (a)
              var nextpos = parseInt($("#player").x())-PLAYER_SPEED;
              if(nextpos > 0){
                $("#player").x(nextpos);
      
              }
            }
            if(jQuery.gameQuery.keyTracker[68]){ //this is right! (d)
              var nextpos = parseInt($("#player").x())+PLAYER_SPEED;
              if(nextpos < PLAYGROUND_WIDTH - playerWidth){
                $("#player").x(nextpos);
      
              }
            }
            if(jQuery.gameQuery.keyTracker[87]){ //this is up! (w)
              var nextpos = parseInt($("#player").y())-PLAYER_SPEED;
              if(nextpos > 0){
                $("#player").y(nextpos);
      
              }
            }
            if(jQuery.gameQuery.keyTracker[83]){ //this is down! (s)
              var nextpos = parseInt($("#player").y())+PLAYER_SPEED;
              if(nextpos < PLAYGROUND_HEIGHT -playerHeight){
                $("#player").y(nextpos);
       
              }
            }
          }
        
      }, REFRESH_RATE);		
		
		}
});
