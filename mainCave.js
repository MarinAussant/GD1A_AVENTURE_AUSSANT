const PLAYER_SPEED = 200;
export class MainCave extends Phaser.Scene{

    constructor(){

        super("MainCave");
        this.player;
        this.cursors;
        this.canOut = true;
        this.playerState; 
        this.firstLoad = true;

    }

    init(data)
    {
        this.entrance = data.entrance;
        this.playerState = data.playerState;
		if (this.entrance == "main" || this.entrance == "other"){
			this.cameras.main.fadeIn(500, 35, 22, 21);
        }
		else {
			this.cameras.main.fadeIn(2000, 35, 22, 21);
        }
        this.canOut = true;
    }

    preload(){
        /*
        this.load.spritesheet('perso','assets/images/perso.png',
        { frameWidth: 32, frameHeight: 48 });
        */

        this.load.spritesheet('persoRunSideRight','assets/images/sideRunningRight.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoRunSideLeft','assets/images/sideRunningLeft.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoRunBot','assets/images/bottomRunning.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoRunTop','assets/images/upRunning.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoIdle','assets/images/idle.png',
        { frameWidth: 32, frameHeight: 64 });

        this.load.image('ennemi',"assets/images/ennemi.png");

        //Load Tiles + TileSet
        this.load.image("Phaser_tuilesdejeu","assets/images/tileset.png");
        this.load.tilemapTiledJSON("carte","assets/jsonTiled.json");
    }
    
    create(){

        const carteDuNiveau = this.add.tilemap("carte");

        // - TILESET
        const tileset = carteDuNiveau.addTilesetImage("placeHolder","Phaser_tuilesdejeu");

        // - DECORS DERRIERE
        const Cave_Princ_Ground = carteDuNiveau.createLayer("Cave_Princ_Ground",tileset);
        const Cave_Princ_Wall = carteDuNiveau.createLayer("Cave_Princ_Wall",tileset);
        const Cave_Princ_Donjon = carteDuNiveau.createLayer("Cave_Princ_Donjon",tileset);

        // - PLAYER 

        if (this.entrance == "main"){
            this.player = this.physics.add.sprite(2440, 2736, 'persoIdle').setScale(1);
            this.player.direction = {x:1,y:0};
        }
        else if (this.entrance == "other"){
            this.player = this.physics.add.sprite(2694, 3350, 'persoIdle').setScale(1);
            this.player.direction = {x:0,y:-1};
        }
        else {
            this.player = this.physics.add.sprite(2200, 3350, 'persoIdle').setScale(1);
            this.player.direction = {x:0,y:0};
            this.playerState = {
                gold : 0,

                isMoving : false,
                isFalling : false,
                isAttacking : false,
                isPropulsing : false,
                isCaping : false,
                isColliding : false,

                canMove : true,

                unlockSortieTemple : false, 
                unlockMainCave : false,
                unlockPropulsa : false,
                unlockSecret1 : false,
                unlockSecret2 : false,
                unlockSecret3 : false,
                unlockCaveau2 : false,

                getSword : true,
                getCape : true,
                getBracelet : true,
                getBoots : true,

            }
        }
        
        this.playerState.canMove = true;
        this.playerState.isPropulsing = false;
        this.player.setSize(15,3).setOffset(8,45);
        this.player.setCollideWorldBounds(true);
        if(this.playerState.getSword) {
            this.player.zoneAttackUpDown = this.physics.add.existing(this.add.rectangle(this.player.x,this.player.y,75,20));
            this.player.zoneAttackGaucheDroite = this.physics.add.existing(this.add.rectangle(this.player.x,this.player.y,20,75));
            this.player.zoneAttackDiag = this.physics.add.existing(this.add.rectangle(this.player.x,this.player.y,35,35));
            this.player.zoneAttackUpDown.body.enable = false;
            this.player.zoneAttackGaucheDroite.body.enable = false;
            this.player.zoneAttackDiag.body.enable = false;
        }

        // - DECORS DEVANT
        const Cave_Princ_Wall_Front = carteDuNiveau.createLayer("Cave_Princ_Wall_Front",tileset);
        const Cave_Princ_Exit = carteDuNiveau.createLayer("Cave_Princ_Exit",tileset);

        // - COLLISIONS
        const Cave_Princ_Collide = carteDuNiveau.createLayer("Cave_Princ_Collide",tileset);
        Cave_Princ_Collide.alpha = 0;
        Cave_Princ_Collide.setCollisionByProperty({ collide: true }); 
        this.physics.add.collider(this.player, Cave_Princ_Collide, this.collide, null,this);

        // - CONTRÔLE CLAVIER
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', () => this.click = true);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keySHIFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // - CAMERA
        this.cameras.main.setSize(1920, 1080);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setDeadzone(50,50);
        this.cameras.main.setBounds(0,0,4960,6400);
        this.cameras.main.setZoom(3);

        // - ANIMATIONS

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('persoRunSideLeft', {start:0,end:11}),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('persoRunSideRight', {start:0,end:11}),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'back',
            frames: this.anims.generateFrameNumbers('persoRunTop', {start:0,end:11}),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'front',
            frames: this.anims.generateFrameNumbers('persoRunBot', {start:0,end:11}),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('persoIdle', {start:0,end:7}),
            frameRate: 8,
            repeat: -1
        });
        /*
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('perso', {start:1,end:3}),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'perso', frame: 4 } ],
            frameRate: 20
        });
    
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('perso', {start:5,end:8}),
            frameRate: 10,
            repeat: -1
        });
        */

    }
    
    
    update(){
        //console.log(this.player.body.position);

        // - ATTAQUE

        if (this.playerState.getSword){
            if (this.click && 
                !this.playerState.isAttacking && 
                !this.playerState.isPropulsing && 
                !this.playerState.isFalling){
                    this.playerState.isAttacking = true;
                    this.click = false;
                    this.attack();
                    this.time.delayedCall(1000, () => {
                        this.playerState.isAttacking = false;
                    })

            };
        }

        // - PROPULSA

        if (this.playerState.getBoots){
            if (Phaser.Input.Keyboard.JustDown(this.keySHIFT) && !this.playerState.isAttacking && !this.playerState.isFalling && !this.playerState.isPropulsing && (Math.abs(this.player.direction.x) != Math.abs(this.player.direction.y))){
                this.playerState.canMove = false;
                this.playerState.isPropulsing = true;
                this.propulsing();
            }

            if (this.playerState.isPropulsing && this.playerState.isColliding){
                this.playerState.isPropulsing = false;
                this.playerState.isColliding = false;
                this.player.setVelocityX(0);
                this.player.setVelocityY(0); 
                this.playerState.canMove = true;
            }
        }

        // - TRIGGERS

        if (this.canOut && (this.player.body.position.x <= 2428 && this.player.body.position.y <= 2782)){
            this.canOut = false;
		    this.cameras.main.fadeOut(400, 255, 254, 170);
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/5);
            this.player.setVelocityY(this.player.body.velocity.y/5); 

			this.time.delayedCall(500, () => {
					this.scene.start('Outdoor', {entrance: "mainCave", playerState : this.playerState});
			})

        }
        else if (this.canOut && (this.player.body.position.x <= 2735 && this.player.body.position.x >= 2648 && this.player.body.position.y >= 3413)){
            this.canOut = false;
            this.cameras.main.fadeOut(400, 255, 254, 170);
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/5);
            this.player.setVelocityY(this.player.body.velocity.y/5); 

			this.time.delayedCall(500, () => {
					this.scene.start('Outdoor', {entrance: "mainCave2", playerState : this.playerState});
			})
        }

        // - MOVEMENT

        if(this.playerState.canMove == true){
            this.playerMovement();
        }
        /*this.moveEnnemi(player);*/
    
    }

    playerMovement(){

        // - DEPLACEMENT ET ANIMATION

        if (this.cursors.left.isDown && (!this.cursors.right.isDown && !this.cursors.down.isDown && !this.cursors.up.isDown)){
            this.playerState.isMoving = true;
            this.player.direction = {x : -1, y : 0};
            this.player.setVelocityX(-PLAYER_SPEED); 
            this.player.setVelocityY(0);
            this.player.anims.play('left', true); 
        }

        if (this.cursors.left.isDown && this.cursors.up.isDown && (!this.cursors.right.isDown && !this.cursors.down.isDown)){
            this.playerState.isMoving = true;
            this.player.direction = { x : -1, y : 1};
            this.player.setVelocityX(-PLAYER_SPEED * (Math.SQRT2)/2); 
            this.player.setVelocityY(-PLAYER_SPEED * (Math.SQRT2/2)); 
            this.player.anims.play('left', true); 
        }

        if (this.cursors.left.isDown && this.cursors.down.isDown && (!this.cursors.right.isDown && !this.cursors.up.isDown)){
            this.playerState.isMoving = true;
            this.player.direction = { x : -1, y : -1};
            this.player.setVelocityX(-PLAYER_SPEED * (Math.SQRT2/2));
            this.player.setVelocityY(PLAYER_SPEED * (Math.SQRT2/2));
            this.player.anims.play('left', true); 
        }


        if (this.cursors.right.isDown && (!this.cursors.left.isDown && !this.cursors.down.isDown && !this.cursors.up.isDown)){ //sinon si la touche droite est appuyée
            this.playerState.isMoving = true;
            this.player.direction = { x : 1, y : 0};
            this.player.setVelocityX(PLAYER_SPEED);
            this.player.setVelocityY(0);
            this.player.anims.play('right', true); 
        }

        if (this.cursors.right.isDown && this.cursors.down.isDown && (!this.cursors.left.isDown && !this.cursors.up.isDown)){
            this.playerState.isMoving = true;
            this.player.direction = { x : 1, y : -1};
            this.player.setVelocityX(PLAYER_SPEED * (Math.SQRT2)/2); 
            this.player.setVelocityY(PLAYER_SPEED * (Math.SQRT2)/2);
            this.player.anims.play('right', true); 
        }

        if (this.cursors.right.isDown && this.cursors.up.isDown && (!this.cursors.left.isDown && !this.cursors.down.isDown)){
            this.playerState.isMoving = true;
            this.player.direction = { x : 1, y : 1};
            this.player.setVelocityX(PLAYER_SPEED * (Math.SQRT2)/2); 
            this.player.setVelocityY(-PLAYER_SPEED * (Math.SQRT2)/2);
            this.player.anims.play('right', true); 
        }

        if (this.cursors.down.isDown && (!this.cursors.right.isDown && !this.cursors.left.isDown && !this.cursors.up.isDown)){
            this.playerState.isMoving = true;
            this.player.direction = { x : 0, y : -1};
            this.player.setVelocityX(0);
            this.player.setVelocityY(PLAYER_SPEED);
            this.player.anims.play('front',true);
        }

        if (this.cursors.up.isDown && (!this.cursors.right.isDown && !this.cursors.down.isDown && !this.cursors.left.isDown)){
            this.playerState.isMoving = true;
            this.player.direction = { x : 0, y : 1};
            this.player.setVelocityX(0);
            this.player.setVelocityY(-PLAYER_SPEED);
            this.player.anims.play('back',true);
        }

        if (!this.cursors.left.isDown && !this.cursors.right.isDown && !this.cursors.down.isDown && !this.cursors.up.isDown){ 
            this.playerState.isMoving = false; 
            this.player.setVelocityX(0);
            this.player.setVelocityY(0); 
            this.player.anims.play('idle',true); 
        }
    }

    attack(){
        if (this.player.direction.x == 0 && this.player.direction.y == 1){
            this.player.zoneAttackUpDown.x = this.player.x;
            this.player.zoneAttackUpDown.y = (this.player.y - 32) + this.player.body.velocity.y/8;
            this.player.zoneAttackUpDown.body.enable = true;
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/3);
            this.player.setVelocityY(this.player.body.velocity.y/3);
            this.time.delayedCall(200, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackUpDown.body.enable = false;
            })
        }
        else if (this.player.direction.x == 0 && this.player.direction.y == -1){
            this.player.zoneAttackUpDown.x = this.player.x;
            this.player.zoneAttackUpDown.y = (this.player.y + 48) + this.player.body.velocity.y/8;
            this.player.zoneAttackUpDown.body.enable = true;
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/3);
            this.player.setVelocityY(this.player.body.velocity.y/3);
            this.time.delayedCall(200, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackUpDown.body.enable = false;
            })
        }
        else if (this.player.direction.x == 1 && this.player.direction.y == 0){
            this.player.zoneAttackGaucheDroite.x = (this.player.x + 32) + this.player.body.velocity.x/8;
            this.player.zoneAttackGaucheDroite.y = this.player.y;
            this.player.zoneAttackGaucheDroite.body.enable = true;
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/3);
            this.player.setVelocityY(this.player.body.velocity.y/3);
            this.time.delayedCall(200, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackGaucheDroite.body.enable = false;
            })
        }
        else if (this.player.direction.x == -1 && this.player.direction.y == 0){
            this.player.zoneAttackGaucheDroite.x = (this.player.x - 32) + this.player.body.velocity.x/8;
            this.player.zoneAttackGaucheDroite.y = this.player.y;
            this.player.zoneAttackGaucheDroite.body.enable = true;
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/3);
            this.player.setVelocityY(this.player.body.velocity.y/3);
            this.time.delayedCall(200, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackGaucheDroite.body.enable = false;
            })
        }
        else if (this.player.direction.x == -1 && this.player.direction.y == 1){
            this.player.zoneAttackDiag.x = (this.player.x - 32) + this.player.body.velocity.x/8;
            this.player.zoneAttackDiag.y = (this.player.y - 32) + this.player.body.velocity.y/8;
            this.player.zoneAttackDiag.body.enable = true;
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/3);
            this.player.setVelocityY(this.player.body.velocity.y/3);
            this.time.delayedCall(200, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackDiag.body.enable = false;
            })
        }
        else if (this.player.direction.x == -1 && this.player.direction.y == -1){
            this.player.zoneAttackDiag.x = (this.player.x - 32) + this.player.body.velocity.x/8;
            this.player.zoneAttackDiag.y = (this.player.y + 32) + this.player.body.velocity.y/8;
            this.player.zoneAttackDiag.body.enable = true;
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/3);
            this.player.setVelocityY(this.player.body.velocity.y/3);
            this.time.delayedCall(200, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackDiag.body.enable = false;
            })
        }
        else if (this.player.direction.x == 1 && this.player.direction.y == 1){
            this.player.zoneAttackDiag.x = (this.player.x + 32) + this.player.body.velocity.x/8;
            this.player.zoneAttackDiag.y = (this.player.y - 32) + this.player.body.velocity.y/8;
            this.player.zoneAttackDiag.body.enable = true;
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/3);
            this.player.setVelocityY(this.player.body.velocity.y/3);
            this.time.delayedCall(200, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackDiag.body.enable = false;
            })
        }
        else if (this.player.direction.x == 1 && this.player.direction.y == -1){
            this.player.zoneAttackDiag.x = (this.player.x + 32) + this.player.body.velocity.x/8;
            this.player.zoneAttackDiag.y = (this.player.y + 32) + this.player.body.velocity.y/8;
            this.player.zoneAttackDiag.body.enable = true;
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/3);
            this.player.setVelocityY(this.player.body.velocity.y/3);
            this.time.delayedCall(200, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackDiag.body.enable = false;
            })
        }
    }

    propulsing(){
        if (this.player.direction.x != 0){
            this.player.setVelocityX((PLAYER_SPEED*2) * this.player.direction.x);
        }
        else {
            this.player.setVelocityY((PLAYER_SPEED*2) * -this.player.direction.y);
        }
    }

    lootCoffre(zone, coffre){
        coffre.body.enable = false;
        coffre.alpha = 0;
        this.dropGold(coffre.x,coffre.y,Math.floor((Math.random()*5)+10));
    }

    dropGold(x,y,nb){
        this.time.addEvent({        
            delay : nb,
            callback : () => {
                this.golds.create(Math.floor((Math.random()*20)-5) + x,Math.floor((Math.random()*30)-5) + y,"gold").setScale(0.02);
                //this.physics.add.image(Math.floor((Math.random()*30)-5) + x, Math.floor((Math.random()*30)-5) + y,"gold").setScale(0.02);
            },
            repeat : nb
        })
    }

    getGold(player, gold){
       
        this.playerState.gold += 1;
        gold.body.enable = false;
        gold.alpha = 0;
            
    }

    collide(){
        if (this.playerState.isPropulsing)this.playerState.isColliding = true;
        else this.playerState.isColliding = false;
    }
    /*
    moveEnnemi(player){

        if (infoEnnemi.isBreaking){

            ennemi.setVelocityX(0);
            ennemi.setVelocityY(0);

        }

        if (infoEnnemi.isMoving){

            if (Math.abs(ennemi.direction.x) - Math.abs(ennemi.direction.y) == 0){
                ennemi.setVelocityX(infoEnnemi.direction.x * (infoEnnemi.vitesse * (Math.SQRT2/2)));
                ennemi.setVelocityY(infoEnnemi.direction.y * (infoEnnemi.vitesse * (Math.SQRT2/2)));
            }
            else {
                ennemi.setVelocityX(infoEnnemi.direction.x * infoEnnemi.vitesse);
                ennemi.setVelocityY(infoEnnemi.direction.y * infoEnnemi.vitesse);
            }

        }

        if(infoEnnemi.isReturning){

        }

        if (infoEnnemi.isAggroing){

            let directions = [
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 0, y: 1},
                {x: -1, y: 1},
                {x: -1, y: 0},
                {x: -1, y: -1},
                {x: 0, y: -1},
                {x: 1, y: -1},
            ];

            var angle = Phaser.Math.Angle.Between(player.x, player.y, ennemi.x, ennemi.y);
            //var direction = {x : player.position.x}player.position - ennemi.position; 
            //console.log(angle);
            let index = Math.round(angle / (Math.PI / 4)) + 4;
            index > 7 ? index -= 8 : index;
            console.log(index);
            var direction = directions[index];

            if (Math.abs(direction.x) - Math.abs(direction.y) == 0){
                ennemi.setVelocityX(direction.x * (infoEnnemi.vitesse * (Math.SQRT2/2)));
                ennemi.setVelocityY(direction.y * (infoEnnemi.vitesse * (Math.SQRT2/2)));
            }
            else {
                ennemi.setVelocityX(direction.x * infoEnnemi.vitesse);
                ennemi.setVelocityY(direction.y * infoEnnemi.vitesse);
            }
        }

        if(Phaser.Math.Distance.Between(player.x, player.y, ennemi.x, ennemi.y) < infoEnnemi.distanceAggro){
            infoEnnemi.isAggroing = true;
        }
        else{
            infoEnnemi.isAggroing = false;
            infoEnnemi.isBreaking = true;
        }


    }
    */


}