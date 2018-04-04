'use strict';

window.gnop = window.gnop || {};

(function(window, ns){

    function Ticker(options){

        var intervalHandle;

        var defaultOptions = {
            containerId: 'container',
            interval: 1000 / 25,
            height: 200,
            width: 300,
            playerHeight: 30,
            playerWidth: 10,
            playerPadding: 10,
            ballHeight: 5,
            ballWidth: 5,
            ballVelocity: {
                x: 5,
                y: 5
            },
            buttons:[
                ['q','a'],
                ['p','l']
            ]
        };

        options = Object.assign({}, defaultOptions, options);

        var state = {
            ticks: 0,
            score: [0, 0,],
            keys: [[false, false], [false, false]]
        };

        var renderState = function(){
            var container = document.getElementById(options.containerId);

            //var html = '<pre>' + JSON.stringify(state, null, 4) + '</pre>';

            var html = '<canvas id="canvas" width="' + options.width + '" height="' + options.height + '"></canvas>';

            container.innerHTML = html;

            var c = document.getElementById("canvas");
            var ctx = c.getContext("2d");
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
            ctx.rect(state.player1.position.x, state.player1.position.y, state.player1.shape.width, state.player1.shape.height);
            ctx.rect(state.player2.position.x, state.player2.position.y, state.player2.shape.width, state.player2.shape.height);
            ctx.rect(state.ball.position.x, state.ball.position.y, state.ball.shape.width, state.ball.shape.height);
            ctx.stroke();
        }

        var tick = function(){
            update();
            renderState();
        };

        var start = function(startTimer){

            var player1Init = {
                shape: {height: options.playerHeight, width: options.playerWidth},
                position: {x: options.playerPadding, y: options.playerPadding},
                velocity: {x: 0, y: 0}
            };

            var player2Init = {
                shape: {height: options.playerHeight, width: options.playerWidth},
                position: {x: options.width - options.playerPadding - options.playerWidth, y: options.playerPadding},
                velocity: {x: 0, y: 0}
            };

            var ballInit = {
                shape: {height: options.ballHeight, width: options.ballWidth},
                position: {
                    x: (options.width / 2) - (options.ballWidth / 2),
                    y: (options.height / 2) - (options.ballHeight / 2)
                },
                velocity: options.ballVelocity
            };

            state.player1 = new Thing(player1Init);
            state.player2 = new Thing(player2Init);
            state.ball = new Thing(ballInit);

            renderState();

            if (startTimer){
                intervalHandle = window.setInterval(tick, options.interval);
            }            
        };

        var stop = function(){
            window.clearTimeout(intervalHandle);
        }

        var update = function(){
            var collision = function(a, b){
                var aPoints = a.toPoints();
                return aPoints.some(function(aPoint){
                    return b.contains(aPoint);
                });
            };

            if (collision(state.ball, state.player1) || collision(state.ball, state.player2)){
                console.log('nice shot');
                state.ball.velocity.x = -1 * state.ball.velocity.x;
            }

            if (state.ball.position.y <= 0 || state.ball.position.y >= options.height - options.ballHeight){
                state.ball.velocity.y = -1 * state.ball.velocity.y;
            }

            if (state.ball.position.x <= 0 || state.ball.position.x >= options.width - options.ballWidth){
                if (state.ball.position.x <= 0) state.score[1] += 1;
                if (state.ball.position.x >= options.width - options.ballWidth) state.score[0] += 1;
                state.ball.position = {
                    x: (options.width / 2) - (options.ballWidth / 2),
                    y: (options.height / 2) - (options.ballHeight / 2)
                };
            }

            var minPlayerY = options.playerPadding;
            var maxPlayerY = options.height - options.playerPadding;
            state.player1.velocity.y = 0;
            state.player2.velocity.y = 0;
            if (state.keys[0][0] && state.player1.position.y < maxPlayerY) state.player1.velocity.y = 5;
            if (state.keys[0][1] && state.player1.position.y > minPlayerY) state.player1.velocity.y = -5;
            if (state.keys[1][0] && state.player2.position.y < maxPlayerY) state.player2.velocity.y = 5;
            if (state.keys[1][1] && state.player2.position.y > minPlayerY) state.player2.velocity.y = -5;

            state.ball.update();
            state.player1.update();
            state.player2.update();
            state.ticks++;
        };

        var keyDown = function(key){
            if (key.toLowerCase() == options.buttons[0][0].toLowerCase()) state.keys[0][0] = true;
            if (key.toLowerCase() == options.buttons[0][1].toLowerCase()) state.keys[0][1] = true;
            if (key.toLowerCase() == options.buttons[1][0].toLowerCase()) state.keys[1][0] = true;
            if (key.toLowerCase() == options.buttons[1][1].toLowerCase()) state.keys[1][1] = true;
        };

        var keyUp = function(key){
            if (key.toLowerCase() == options.buttons[0][0].toLowerCase()) state.keys[0][0] = false;
            if (key.toLowerCase() == options.buttons[0][1].toLowerCase()) state.keys[0][1] = false;
            if (key.toLowerCase() == options.buttons[1][0].toLowerCase()) state.keys[1][0] = false;
            if (key.toLowerCase() == options.buttons[1][1].toLowerCase()) state.keys[1][1] = false;
        };

        return {
            Start: start,
            Stop: stop,
            Tick: tick,
            KeyDown: keyDown,
            KeyUp: keyUp
        };
    }

    function Thing(options){
        var self = this;
        self.shape = new Shape(options.shape);
        self.position = new Position(options.position);
        self.velocity = new Velocity(options.velocity);
        self.update = function(){
            self.position.x += self.velocity.x;
            self.position.y += self.velocity.y;
        };
        self.toPoints = function(){
            var point1 = {x: self.position.x, y: self.position.y};
            var point2 = {x: self.position.x + self.shape.width, y: self.position.y};
            var point3 = {x: self.position.x + self.shape.width, y: self.position.y + self.shape.height};
            var point4 = {x: self.position.x, y: self.position.y + self.shape.height};
            return [point1, point2, point3, point4];
        }
        self.contains = function(point){
            var points = self.toPoints();
            if (point.x >= points[0].x && point.x <= points[1].x){
                if (point.y >= points[1].y && point.y <= points[2].y){
                    return true;
                }
            }
            return false;
        }
    }

    function Shape(options){
        var self = this;
        self.height = options.height;
        self.width = options.width;
    }

    function Position(options){
        var self = this;
        self.x = options.x;
        self.y = options.y;
    }

    function Velocity(options){
        var self = this;
        self.x = options.x;
        self.y = options.y;
    }

    var ticker = Ticker();

    ns.start = function(startTimer){
        ticker.Start(startTimer);

        window.onkeydown = function(e){
            var key = String.fromCharCode(e.keyCode);
            ticker.KeyDown(key);
        };
    
        window.onkeyup = function(e){
            var key = String.fromCharCode(e.keyCode);
            ticker.KeyUp(key);
        };
    };

    ns.stop = function(){
        ticker.Stop();
    }

    ns.tick = function(){
        ticker.Tick();
    }

})(window, window.gnop);