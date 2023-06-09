const PLAYER_SPEED = 200;
const MOMIES_SPEED = 25;
export class DonjonCape extends Phaser.Scene{

    constructor(){

        super("DonjonCape");
        this.player;
        this.cursors;
        this.canOut = true;
        this.playerState; 
        this.controller = false;
        this.tutoText;
    }

    init(data)
    {
        this.entrance = data.entrance;
        this.playerState = data.playerState;
	    this.cameras.main.fadeIn(500, 35, 22, 21);
        this.canOut = true;

    }

    preload(){
        // UI
        this.load.spritesheet('uiLife','assets/ui/uiLife.png',
        { frameWidth: 1920, frameHeight: 1080 });
        this.load.image('uiInvGold',"assets/ui/uiInvGold.png");
        this.load.image('sword',"assets/items/cimeterre.png");
        this.load.image('cape',"assets/items/cape.png");
        this.load.image('braceletInv',"assets/items/bracelet.png");
        this.load.image('boot',"assets/items/boot.png");

        // Srritesheet Perso Principal 

        // Déplacement
        this.load.spritesheet('persoRunSideRight','assets/animations/sideRunningRight.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoRunSideLeft','assets/animations/sideRunningLeft.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoRunBot','assets/animations/bottomRunning.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoRunTop','assets/animations/upRunning.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoIdle','assets/animations/idle.png',
        { frameWidth: 32, frameHeight: 64 });
        // Attaque
        this.load.spritesheet('persoHitRight','assets/animations/hitRight.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoHitLeft','assets/animations/hitLeft.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoHitUp','assets/animations/hitUp.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('persoHitBot','assets/animations/hitBot.png',
        { frameWidth: 32, frameHeight: 64 });
        // Propulsion
        this.load.spritesheet('propulsaRight','assets/animations/propulsaRight.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('propulsaLeft','assets/animations/propulsaLeft.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('propulsaBot','assets/animations/propulsaBot.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('propulsaTop','assets/animations/propulsaTop.png',
        { frameWidth: 32, frameHeight: 64 });
        // Bracelet
        this.load.spritesheet('bracelet','assets/animations/bracelet.png',
        { frameWidth: 32, frameHeight: 64 });

        this.load.image('ennemi',"assets/images/ennemi.png");
        this.load.image('gold',"assets/items/goldGround.png");
        this.load.image('life',"assets/items/lifeGround.png");
        this.load.image('shadow',"assets/images/shadow.png");

        // Spritesheet Momies
        this.load.spritesheet('momieRight','assets/animations/rightMomie.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('momieLeft','assets/animations/leftMomie.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('momieBot','assets/animations/frontMomie.png',
        { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('momieTop','assets/animations/backMomie.png',
        { frameWidth: 32, frameHeight: 64 });

        this.load.image('coffreDevantCave',"assets/images/frontChestCave.png");
        this.load.image('coffreCoteCave',"assets/images/sideChestCave.png");

        //Load Tiles + TileSet
        this.load.image("Phaser_tuilesdejeu","assets/images/tileset.png");
        this.load.tilemapTiledJSON("carte","assets/jsonTiled.json");
    }
    
    create(){

        const carteDuNiveau = this.add.tilemap("carte");

        // - TILESET
        const tileset = carteDuNiveau.addTilesetImage("placeHolder","Phaser_tuilesdejeu");

        // - DECORS DERRIERE
        const DonjonCape_Ground = carteDuNiveau.createLayer("DonjonCape_Ground",tileset);
        const DonjonCape_Back = carteDuNiveau.createLayer("DonjonCape_Back",tileset);

        // - PLAYER 

        this.golds = this.physics.add.group({allowGravity: false,immovable : true});
        this.lifes = this.physics.add.group({allowGravity: false,immovable : true});

        this.shadow = this.physics.add.image(0,0,'shadow');
        
        this.windForce = {x:0,y:0};

        this.player = this.physics.add.sprite(1280, 4288, 'perso').setScale(1);
        this.player.direction = {x:-1,y:0};
        this.playerState.canMove = true;
        this.playerState.isPropulsing = false;
        this.player.setSize(15,3).setOffset(8,61);
        this.player.setCollideWorldBounds(true);

        this.player.zoneAttackUpDown = this.physics.add.existing(this.add.rectangle(this.player.x,this.player.y,75,40));
        this.player.zoneAttackGaucheDroite = this.physics.add.existing(this.add.rectangle(this.player.x,this.player.y,40,75));
        this.player.zoneAttackDiag = this.physics.add.existing(this.add.rectangle(this.player.x,this.player.y,50,50));
        this.player.zoneAttackUpDown.body.enable = false;
        this.player.zoneAttackGaucheDroite.body.enable = false;
        this.player.zoneAttackDiag.body.enable = false;

        this.momies = this.physics.add.group();
        const DonjonCape_Momies = carteDuNiveau.getObjectLayer('DonjonCape_Momies');
        DonjonCape_Momies.objects.forEach(eachMomie => {
            this.momies.create(eachMomie.x+16,  eachMomie.y-16, "momieBot").body.setAllowGravity(false);
        });
        this.momies.children.each(function (momie) {
            momie.hp = 3;
            momie.isAlive = true;
            momie.getHit = false;
            momie.canMove = true;
            momie.setSize(20,40).setOffset(6,18);
            momie.direction = {x : 0, y : -1};
        })

        // - ADD ... choses.... cool ? 

        this.physics.add.overlap(this.shadow,this.golds, this.getGold, null, this);
        this.physics.add.overlap(this.shadow,this.lifes, this.getLife, null, this);

        // Colliders Momies
        this.physics.add.collider(this.momies,this.momies);
        this.physics.add.overlap(this.shadow,this.momies,this.takeDamage,null,this);
        this.physics.add.overlap(this.player.zoneAttackUpDown, this.momies, this.hitEnnemi,null,this);
        this.physics.add.overlap(this.player.zoneAttackGaucheDroite, this.momies, this.hitEnnemi,null,this);
        this.physics.add.overlap(this.player.zoneAttackDiag, this.momies, this.hitEnnemi,null,this);

        // - DECORS DEVANT
        const DonjonCape_Front = carteDuNiveau.createLayer("DonjonCape_Front",tileset);


        if (!this.playerState.getCape){
            this.cape = this.physics.add.image(864+16,4096+16,"cape").setScale(0.5);
        }

        this.physics.add.collider(this.shadow,this.cape,this.haveCape,null,this);

        // - COLLISIONS
        const DonjonCape_Collide = carteDuNiveau.createLayer("DonjonCape_Collide",tileset);
        DonjonCape_Collide.alpha = 0;
        DonjonCape_Collide.setCollisionByProperty({ collide: true }); 
        this.physics.add.collider(this.player, DonjonCape_Collide, this.collide, null,this);
        this.physics.add.collider(this.momies, DonjonCape_Collide);

        // - CONTRÔLE CLAVIER
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', () => {
            if(this.playerState.getSword)this.click = true
        },this);

        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
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
        this.cameras.main.setZoom(2.5);

        // - UI

        this.uiLife = this.add.sprite(1920/3.35,1080/3.35, 'uiLife').setOrigin(0,0).setScrollFactor(0).setScale(0.51);
        this.add.image(1920/3.35,1080/3.35,'uiInvGold').setOrigin(0,0).setScrollFactor(0).setScale(0.51);
        this.textGold = this.add.text(735,356,this.playerState.gold+'x',{ fontSize:'10px',fill:'#f5ffff'}).setScrollFactor(0);

        if(this.playerState.getSword) {this.add.image(600,462,"sword").setOrigin(0,0).setScrollFactor(0).setScale(0.75);}
        if(this.playerState.getCape) {this.add.image(600,538,"cape").setOrigin(0,0).setScrollFactor(0).setScale(0.75);}
        if(this.playerState.getBracelet) {this.add.image(600,612,"braceletInv").setOrigin(0,0).setScrollFactor(0).setScale(0.75);}
        if(this.playerState.getBoots) {this.add.image(599,690,"boot").setOrigin(0,0).setScrollFactor(0).setScale(0.75);}

        // - ANIMATIONS

        // Ui

        this.anims.create({
            key: 'life5',
            frames: this.anims.generateFrameNumbers('uiLife', { frames: [0] }),
            repeat: 0
        });
        this.anims.create({
            key: 'life4',
            frames: this.anims.generateFrameNumbers('uiLife', { frames: [1] }),
            repeat: 0
        });
        this.anims.create({
            key: 'life3',
            frames: this.anims.generateFrameNumbers('uiLife', { frames: [2] }),
            repeat: 0
        });
        this.anims.create({
            key: 'life2',
            frames: this.anims.generateFrameNumbers('uiLife', { frames: [3] }),
            repeat: 0
        });
        this.anims.create({
            key: 'life1',
            frames: this.anims.generateFrameNumbers('uiLife', { frames: [4] }),
            repeat: 0
        });

        // Animations Perso
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
        this.anims.create({
            key: 'hitRight',
            frames: this.anims.generateFrameNumbers('persoHitRight', {start:0,end:10}),
            frameRate: 33,
            repeat: 0
        });
        this.anims.create({
            key: 'hitLeft',
            frames: this.anims.generateFrameNumbers('persoHitLeft', {start:0,end:10}),
            frameRate: 33,
            repeat: 0
        });
        this.anims.create({
            key: 'hitUp',
            frames: this.anims.generateFrameNumbers('persoHitUp', {start:0,end:10}),
            frameRate: 33,
            repeat: 0
        });
        this.anims.create({
            key: 'hitBot',
            frames: this.anims.generateFrameNumbers('persoHitBot', {start:0,end:10}),
            frameRate: 33,
            repeat: 0
        });
        this.anims.create({
            key: 'propulsaLeft',
            frames: this.anims.generateFrameNumbers('propulsaLeft', {start:0,end:5}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'propulsaRight',
            frames: this.anims.generateFrameNumbers('propulsaRight', {start:0,end:5}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'propulsaBot',
            frames: this.anims.generateFrameNumbers('propulsaBot', {start:0,end:5}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'propulsaTop',
            frames: this.anims.generateFrameNumbers('propulsaTop', {start:0,end:5}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'bracelet',
            frames: this.anims.generateFrameNumbers('bracelet', {start:0,end:8}),
            frameRate: 9,
            repeat: 0
        });

        // Animations Momies
        this.anims.create({
            key: 'leftMomie',
            frames: this.anims.generateFrameNumbers('momieLeft', {start:0,end:11}),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'rightMomie',
            frames: this.anims.generateFrameNumbers('momieRight', {start:0,end:11}),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'botMomie',
            frames: this.anims.generateFrameNumbers('momieBot', {start:0,end:11}),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'topMomie',
            frames: this.anims.generateFrameNumbers('momieTop', {start:0,end:11}),
            frameRate: 12,
            repeat: -1
        });

    }
    
    
    update(){

        if(this.playerState.hp == 5){
            this.uiLife.anims.play("life5",true);
        }
        if(this.playerState.hp == 4){
            this.uiLife.anims.play("life4",true);
        }
        if(this.playerState.hp == 3){
            this.uiLife.anims.play("life3",true);
        }
        if(this.playerState.hp == 2){
            this.uiLife.anims.play("life2",true);
        }
        if(this.playerState.hp == 1){
            this.uiLife.anims.play("life1",true);
        }

        // - SUIVI DE SHADOW

        this.shadow.body.position.x = this.player.x - 17;
        this.shadow.body.position.y = this.player.y + 6;

        // - ATTAQUE

        if (this.playerState.getSword){
            if (this.click && 
                !this.playerState.isAttacking && 
                !this.playerState.isPropulsing && 
                !this.playerState.isFalling){
                    this.playerState.isAttacking = true;
                    this.click = false;
                    this.attack();
                    this.time.delayedCall(387, () => {
                        this.playerState.isAttacking = false;
                    })

            };
        }

        // - CAPE
        if (this.playerState.getCape){
            if((Phaser.Input.Keyboard.JustDown(this.keyC) || this.controller.Y) && !this.playerState.isPropulsing && !this.playerState.isAttacking){
                this.tutoText.setText("");
                this.playerState.canMove = true;
                if (this.playerState.isCaping){
                    this.player.setTint(0xffffff);
                    this.playerState.isCaping = false;
                }
                else{
                    this.player.setTint(0xff4967);
                    this.playerState.isCaping = true;
                }
            }
        }

        
        // - PROPULSA

        if (this.playerState.getBoots){
            if ((Phaser.Input.Keyboard.JustDown(this.keySHIFT) || this.controller.A) && !this.playerState.isAttacking && !this.playerState.isFalling && !this.playerState.isPropulsing && (Math.abs(this.player.direction.x) != Math.abs(this.player.direction.y))){
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

        // TRIGGERS BRACELET
        if (this.playerState.getBracelet && Phaser.Input.Keyboard.JustDown(this.keyA) && !this.playerState.isAttacking && !this.playerState.isPropulsing){

            this.player.setVelocityX(0);
            this.player.setVelocityY(0); 
            this.playerState.canMove = false;
            this.player.anims.play("bracelet",true);
            this.cameras.main.fadeOut(300, 184, 231, 249);
            this.time.delayedCall(300, () => {
                this.cameras.main.fadeIn(1000, 184, 231, 249);
                this.playerState.canMove = true;
            })
        }

        // - TRIGGERS

        if (this.canOut && (this.player.body.position.x >= 1248 && this.player.body.position.x <= 1344 && this.player.body.position.y >= 4384)){
            this.canOut = false;
		    this.cameras.main.fadeOut(400, 255, 254, 170);
            this.playerState.canMove = false;
            this.player.setVelocityX(this.player.body.velocity.x/5);
            this.player.setVelocityY(this.player.body.velocity.y/5); 

			this.time.delayedCall(500, () => {
					this.scene.start('Outdoor', {entrance: "donjonCape", playerState : this.playerState});
			})

        }

        // - MOVEMENT

        if(this.playerState.canMove == true){
            this.playerMovement();
        }

        this.moveMomies();
    
    }

    playerMovement(){

        // - DEPLACEMENT ET ANIMATION

        if ((this.keyQ.isDown || this.controller.left) && (!this.keyD.isDown && !this.keyS.isDown && !this.keyZ.isDown && !this.controller.right && !this.controller.down && !this.controller.up)){
            this.playerState.isMoving = true;
            this.player.direction = {x : -1, y : 0};
            if (this.playerState.isCaping){
                this.player.setVelocityX(-PLAYER_SPEED/2);
                this.player.setVelocityY(0);
            }
            else{
                this.player.setVelocityX(-PLAYER_SPEED); 
                this.player.setVelocityY(0  + this.windForce.y);
            }
            this.player.anims.play('left', true); 
        }

        if (((this.keyQ.isDown && this.keyZ.isDown)||(this.controller.left && this.controller.up))&& (!this.keyD.isDown && !this.keyS.isDown && !this.controller.down && !this.controller.right)){
            this.playerState.isMoving = true;
            this.player.direction = { x : -1, y : 1};
            if (this.playerState.isCaping){
                this.player.setVelocityX(-PLAYER_SPEED/2 * (Math.SQRT2)/2); 
                this.player.setVelocityY(-PLAYER_SPEED/2 * (Math.SQRT2/2)); 
            }
            else{
                this.player.setVelocityX(-PLAYER_SPEED * (Math.SQRT2)/2); 
                this.player.setVelocityY(-PLAYER_SPEED * (Math.SQRT2/2)  + this.windForce.y); 
            }
            this.player.anims.play('left', true); 
        }

        if (((this.keyQ.isDown && this.keyS.isDown)||(this.controller.left && this.controller.down)) && (!this.keyD.isDown && !this.keyZ.isDown && !this.controller.right && !this.controller.up)){
            this.playerState.isMoving = true;
            this.player.direction = { x : -1, y : -1};
            if (this.playerState.isCaping){
                this.player.setVelocityX(-PLAYER_SPEED/2 * (Math.SQRT2/2));
                this.player.setVelocityY(PLAYER_SPEED/2 * (Math.SQRT2/2));
            }
            else{
                this.player.setVelocityX(-PLAYER_SPEED * (Math.SQRT2/2));
                this.player.setVelocityY(PLAYER_SPEED * (Math.SQRT2/2) + this.windForce.y);
            }
            this.player.anims.play('left', true); 
        }


        if ((this.keyD.isDown || this.controller.right) && (!this.keyQ.isDown && !this.keyS.isDown && !this.keyZ.isDown && !this.controller.left && !this.controller.down && !this.controller.up)){ //sinon si la touche droite est appuyée
            this.playerState.isMoving = true;
            this.player.direction = { x : 1, y : 0};
            if (this.playerState.isCaping){
                this.player.setVelocityX(PLAYER_SPEED/2);
                this.player.setVelocityY(0);
            }
            else{
                this.player.setVelocityX(PLAYER_SPEED);
                this.player.setVelocityY(0 + this.windForce.y);
            }
            this.player.anims.play('right', true); 
        }

        if (((this.keyD.isDown && this.keyS.isDown)||(this.controller.right && this.controller.down))&& (!this.keyQ.isDown && !this.keyZ.isDown && !this.controller.left && !this.controller.up)){
            this.playerState.isMoving = true;
            this.player.direction = { x : 1, y : -1};
            if (this.playerState.isCaping){
                this.player.setVelocityX(PLAYER_SPEED/2 * (Math.SQRT2)/2); 
                this.player.setVelocityY(PLAYER_SPEED/2 * (Math.SQRT2)/2);
            }
            else{
                this.player.setVelocityX(PLAYER_SPEED * (Math.SQRT2)/2); 
                this.player.setVelocityY(PLAYER_SPEED * (Math.SQRT2)/2 + this.windForce.y);
            }
            this.player.anims.play('right', true); 
        }

        if (((this.keyD.isDown && this.keyZ.isDown)||(this.controller.right && this.controller.up)) && (!this.keyQ.isDown && !this.keyS.isDown && !this.controller.down && !this.controller.left)){
            this.playerState.isMoving = true;
            this.player.direction = { x : 1, y : 1};
            if (this.playerState.isCaping){
                this.player.setVelocityX(PLAYER_SPEED/2 * (Math.SQRT2)/2); 
                this.player.setVelocityY(-PLAYER_SPEED/2 * (Math.SQRT2)/2);
            }
            else{
                this.player.setVelocityX(PLAYER_SPEED * (Math.SQRT2)/2); 
                this.player.setVelocityY(-PLAYER_SPEED * (Math.SQRT2)/2 + this.windForce.y);
            }
            this.player.anims.play('right', true); 
        }

        if ((this.keyS.isDown || this.controller.down) && (!this.keyD.isDown && !this.keyQ.isDown && !this.keyZ.isDown && !this.controller.right && !this.controller.left && !this.controller.up)){
            this.playerState.isMoving = true;
            this.player.direction = { x : 0, y : -1};
            if (this.playerState.isCaping){
                this.player.setVelocityX(0);
                this.player.setVelocityY(PLAYER_SPEED/2);
            }
            else{
                this.player.setVelocityX(0);
                this.player.setVelocityY(PLAYER_SPEED + this.windForce.y);
            }
            this.player.anims.play('front',true);
        }

        if ((this.keyZ.isDown || this.controller.up) && (!this.keyD.isDown && !this.keyS.isDown && !this.keyQ.isDown && !this.controller.right && !this.controller.down && !this.controller.left)){
            this.playerState.isMoving = true;
            this.player.direction = { x : 0, y : 1};
            if (this.playerState.isCaping){
                this.player.setVelocityX(0);
                this.player.setVelocityY(-PLAYER_SPEED/2);
            }
            else{
                this.player.setVelocityX(0);
                this.player.setVelocityY(-PLAYER_SPEED + this.windForce.y);
            }
            this.player.anims.play('back',true);
        }

        if ((!this.keyQ.isDown && !this.keyD.isDown && !this.keyS.isDown && !this.keyZ.isDown) || (!this.controller.left && !this.controller.right && !this.controller.up && this.controller.down)){ 
            this.playerState.isMoving = false; 
            if (this.playerState.isCaping){
                this.player.setVelocityX(0);
                this.player.setVelocityY(0);
            }
            else{
                this.player.setVelocityX(0);
                this.player.setVelocityY(0 + this.windForce.y); 
            }
            this.player.anims.play('idle',true); 
        }
    }

    attack(){

        if (this.player.direction.x == 0 && this.player.direction.y == 1){
            this.player.zoneAttackUpDown.x = this.player.x;
            this.player.zoneAttackUpDown.y = (this.player.y-16) + this.player.body.velocity.y/12;
            this.player.zoneAttackUpDown.body.enable = true;
            this.playerState.canMove = false;
            this.player.anims.play('hitUp', true); 
            this.player.setVelocityX(this.player.body.velocity.x/7);
            this.player.setVelocityY(this.player.body.velocity.y/7);
            this.time.delayedCall(387, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackUpDown.body.enable = false;
            })
        }
        else if (this.player.direction.x == 0 && this.player.direction.y == -1){
            this.player.zoneAttackUpDown.x = this.player.x;
            this.player.zoneAttackUpDown.y = (this.player.y + 64) + this.player.body.velocity.y/12;
            this.player.zoneAttackUpDown.body.enable = true;
            this.playerState.canMove = false;
            this.player.anims.play('hitBot', true); 
            this.player.setVelocityX(this.player.body.velocity.x/7);
            this.player.setVelocityY(this.player.body.velocity.y/7);
            this.time.delayedCall(387, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackUpDown.body.enable = false;
            })
        }
        else if (this.player.direction.x == 1 && this.player.direction.y == 0){
            this.player.zoneAttackGaucheDroite.x = (this.player.x + 32) + this.player.body.velocity.x/12;
            this.player.zoneAttackGaucheDroite.y = this.player.y;
            this.player.zoneAttackGaucheDroite.body.enable = true;
            this.playerState.canMove = false;
            this.player.anims.play('hitRight', true); 
            this.player.setVelocityX(this.player.body.velocity.x/7);
            this.player.setVelocityY(this.player.body.velocity.y/7);
            this.time.delayedCall(387, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackGaucheDroite.body.enable = false;
            })
        }
        else if (this.player.direction.x == -1 && this.player.direction.y == 0){
            this.player.zoneAttackGaucheDroite.x = (this.player.x - 32) + this.player.body.velocity.x/12;
            this.player.zoneAttackGaucheDroite.y = this.player.y;
            this.player.zoneAttackGaucheDroite.body.enable = true;
            this.playerState.canMove = false;
            this.player.anims.play('hitLeft', true);
            this.player.setVelocityX(this.player.body.velocity.x/7);
            this.player.setVelocityY(this.player.body.velocity.y/7);
            this.time.delayedCall(387, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackGaucheDroite.body.enable = false;
            })
        }
        else if (this.player.direction.x == -1 && this.player.direction.y == 1){
            this.player.zoneAttackDiag.x = (this.player.x - 32) + this.player.body.velocity.x/12;
            this.player.zoneAttackDiag.y = (this.player.y) + this.player.body.velocity.y/12;
            this.player.zoneAttackDiag.body.enable = true;
            this.playerState.canMove = false;
            this.player.anims.play('hitLeft', true);
            this.player.setVelocityX(this.player.body.velocity.x/7);
            this.player.setVelocityY(this.player.body.velocity.y/7);
            this.time.delayedCall(387, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackDiag.body.enable = false;
            })
        }
        else if (this.player.direction.x == -1 && this.player.direction.y == -1){
            this.player.zoneAttackDiag.x = (this.player.x - 32) + this.player.body.velocity.x/12;
            this.player.zoneAttackDiag.y = (this.player.y + 32) + this.player.body.velocity.y/12;
            this.player.zoneAttackDiag.body.enable = true;
            this.playerState.canMove = false;
            this.player.anims.play('hitLeft', true); 
            this.player.setVelocityX(this.player.body.velocity.x/7);
            this.player.setVelocityY(this.player.body.velocity.y/7);
            this.time.delayedCall(387, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackDiag.body.enable = false;
            })
        }
        else if (this.player.direction.x == 1 && this.player.direction.y == 1){
            this.player.zoneAttackDiag.x = (this.player.x + 32) + this.player.body.velocity.x/12;
            this.player.zoneAttackDiag.y = (this.player.y) + this.player.body.velocity.y/12;
            this.player.zoneAttackDiag.body.enable = true;
            this.playerState.canMove = false;
            this.player.anims.play('hitRight', true); 
            this.player.setVelocityX(this.player.body.velocity.x/7);
            this.player.setVelocityY(this.player.body.velocity.y/7);
            this.time.delayedCall(387, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackDiag.body.enable = false;
            })
        }
        else if (this.player.direction.x == 1 && this.player.direction.y == -1){
            this.player.zoneAttackDiag.x = (this.player.x + 32) + this.player.body.velocity.x/12;
            this.player.zoneAttackDiag.y = (this.player.y + 32) + this.player.body.velocity.y/12;
            this.player.zoneAttackDiag.body.enable = true;
            this.playerState.canMove = false;
            this.player.anims.play('hitRight', true); 
            this.player.setVelocityX(this.player.body.velocity.x/7);
            this.player.setVelocityY(this.player.body.velocity.y/7);
            this.time.delayedCall(387, () => {
                this.playerState.canMove = true;
                this.player.zoneAttackDiag.body.enable = false;
            })
        }
    }

    propulsing(){
        
        if (this.player.direction.x != 0){
            this.player.setVelocityY(0);
            this.player.setVelocityX((PLAYER_SPEED*2) * this.player.direction.x);
            if (this.player.direction.x == -1) this.player.anims.play("propulsaLeft",true);
            else this.player.anims.play("propulsaRight",true)
        }
        else {
            this.player.setVelocityX(0);
            this.player.setVelocityY((PLAYER_SPEED*2) * -this.player.direction.y);
            if (this.player.direction.y == -1) this.player.anims.play("propulsaBot",true);
            else this.player.anims.play("propulsaTop",true)
        }
    }

    dropGold(x,y,nb){
        var spawnLife = Math.floor(Math.random()*3)
        console.log(spawnLife);
        this.time.addEvent({        
            delay : 40,
            callback : () => {
                this.golds.create(Math.floor((Math.random()*20)-5) + x,Math.floor((Math.random()*30)-5) + y,"gold").setScale(0.85).setAlpha(0.9);
            },
            repeat : nb
        })
        if (spawnLife == 0){
            this.time.delayedCall(400, () => {
                this.lifes.create(Math.floor((Math.random()*20)-5) + x,Math.floor((Math.random()*30)-5) + y,"life").setScale(0.85).setAlpha(0.9);
            })
        }
    }

    getGold(player, gold){
       
        this.playerState.gold += 1;
        this.textGold.text = this.playerState.gold + "x";
        gold.body.enable = false;
        gold.alpha = 0;
            
    }

    getLife(player, life){   
        if(this.playerState.hp < 5){
            this.playerState.hp += 1;
        }
        life.body.enable = false;
        life.alpha = 0;
            
    }


    collide(){
        if (this.playerState.isPropulsing)this.playerState.isColliding = true;
        else this.playerState.isColliding = false;
    }

    moveMomies(){
        this.momies.children.each(function (momie) {

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

            if(Phaser.Math.Distance.Between(this.player.x, this.player.y, momie.x, momie.y) < 200){
                var angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, momie.x, momie.y);
                let index = Math.round(angle / (Math.PI / 4)) + 4;
                index > 7 ? index -= 8 : index;
                momie.direction = directions[index];

                if(momie.canMove){

                    if (momie.direction.x == 0 && momie.direction.y == 1){
                        momie.setVelocityX( momie.direction.x * MOMIES_SPEED );
                        momie.setVelocityY( momie.direction.y * MOMIES_SPEED );
                        momie.anims.play('botMomie', true)
                    }
                    if (momie.direction.x == 0 && momie.direction.y == -1){
                        momie.setVelocityX( momie.direction.x * MOMIES_SPEED );
                        momie.setVelocityY( momie.direction.y * MOMIES_SPEED );
                        momie.anims.play('topMomie', true)
                    }
                    if (momie.direction.x == 1 && momie.direction.y == 0){
                        momie.setVelocityX( momie.direction.x * MOMIES_SPEED );
                        momie.setVelocityY( momie.direction.y * MOMIES_SPEED );
                        momie.anims.play('rightMomie', true)
                    }
                    else if (momie.direction.x == -1 && momie.direction.y == 0){
                        momie.setVelocityX( momie.direction.x * MOMIES_SPEED );
                        momie.setVelocityY( momie.direction.y * MOMIES_SPEED );
                        momie.anims.play('leftMomie', true)
                    }
                    if (momie.direction.x == -1 && momie.direction.y == 1){
                        momie.setVelocityX( momie.direction.x * (MOMIES_SPEED * (Math.SQRT2/2)));
                        momie.setVelocityY( momie.direction.y * (MOMIES_SPEED * (Math.SQRT2/2)));
                        momie.anims.play('leftMomie', true)
                    }
                    if (momie.direction.x == -1 && momie.direction.y == -1){
                        momie.setVelocityX( momie.direction.x * (MOMIES_SPEED * (Math.SQRT2/2)));
                        momie.setVelocityY( momie.direction.y * (MOMIES_SPEED * (Math.SQRT2/2)));
                        momie.anims.play('leftMomie', true)
                    }
                    if (momie.direction.x == 1 && momie.direction.y == -1){
                        momie.setVelocityX( momie.direction.x * (MOMIES_SPEED * (Math.SQRT2/2)));
                        momie.setVelocityY( momie.direction.y * (MOMIES_SPEED * (Math.SQRT2/2)));
                        momie.anims.play('rightMomie', true)
                    }
                    if (momie.direction.x == 1 && momie.direction.y == 1){
                        momie.setVelocityX( momie.direction.x * (MOMIES_SPEED * (Math.SQRT2/2)));
                        momie.setVelocityY( momie.direction.y * (MOMIES_SPEED * (Math.SQRT2/2)));
                        momie.anims.play('rightMomie', true)
                    }
                }
            }
            else{
                momie.setVelocityX(0);
                momie.setVelocityY(0);
            }
            
            
        }, this)
    }

    hitEnnemi(player,ennemi){
        if(!ennemi.getHit){
            ennemi.getHit = true;
            ennemi.hp -= 1
            ennemi.canMove = false;
            this.cameras.main.shake(200, 0.0001);
            ennemi.setTint(0xff4967);
            ennemi.setVelocityX(-ennemi.direction.x * ennemi.body.speed*2);
            ennemi.setVelocityY(-ennemi.direction.y * ennemi.body.speed*2);
            this.time.delayedCall(400, () => {

                if(ennemi.hp <= 0){
                    this.tweens.add({
                        targets: ennemi,
                        alpha: 0,
                        duration: 300,
                        ease: 'Power2'
                    });
                    this.time.delayedCall(200, () => {
                        this.dropGold(ennemi.x,ennemi.y,Math.floor((Math.random()*3)+1))
                        ennemi.destroy();
                    })
                }
                else {
                    ennemi.setTint(0xffffff);
                    ennemi.canMove = true;
                    ennemi.getHit = false;
                }    
            })

        }
    }

    takeDamage(){
        if(!this.playerState.takingDamage){
            this.playerState.takingDamage = true;
            this.cameras.main.shake(200, 0.0002);
            this.playerState.hp -= 1;
            this.player.setTint(0xff4967);

            if(this.playerState.isPropulsing){
                this.playerState.isColliding = true;
            }

            this.time.delayedCall(1000, () => {
                this.playerState.takingDamage = false;
                this.player.setTint(0xffffff);
            })
        }
        
    }

    haveCape(shadow,sword){
        this.playerState.getCape = true;
        this.add.image(600,538,"cape").setOrigin(0,0).setScrollFactor(0).setScale(0.75);
        this.cape.alpha = 0;
        this.cape.destroy();
        this.playerState.canMove = false;
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);
        this.tutoText = this.add.text(750,450,"'C' to equip !",{ fontSize:'40px',fill:'#ff4967', fontStyle:"bold"}).setScrollFactor(0);
    }
}