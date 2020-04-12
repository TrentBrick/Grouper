export class Rocket {
  constructor(params) {
    //this.container = new PIXI.Container();

    const random_image_ind = Math.floor(Math.random() * Math.floor(3)) // 4 different things. 
    console.log('rocket image is:', random_image_ind)

    const image_files = ['alex.jpg', 'trent.jpg', 'grace.jpg']

    this.sprite = PIXI.Sprite.fromImage("static/images/" + image_files[random_image_ind]);
    this.sprite.id = params.id;
    this.sprite.x = params.x;
    this.sprite.y = params.y;
    this.sprite.height = 150;
    this.sprite.width = 120;
    this.sprite.inContact = false;
    var self = this;
    //this.container.addChild(this.sprite)

    // overhead message

    //Create the text sprite
    const style = new PIXI.TextStyle({
      fontFamily: "sans-serif",
      fontSize: 18,
      fill: "white",
    }); 

    this.sprite.message = new PIXI.Text("Want to meet? Click me! \n Then share the link back here! ", style);
    this.sprite.message.anchor.set(0.5);
    //this.sprite.message.position.set(params.x-8, params.y-8);
    this.sprite.message.visible = false
    //this.sprite.message.anchor.set(0.5);
    this.sprite.message.interactive = true;
    this.sprite.message.buttonMode = true;
    this.sprite.message.addListener('pointerdown', function (e) {
      
      console.log(e);

      const url = "http://hangouts.google.com/start";
      window.open(url);

      //console.log('current text of the message', sprite)
      //self.sprite.message.text= "Put the Share Link in the Box!"
      //self.sprite.message.visible = false;

      var popup = document.getElementById("input_link");
      console.log('got the document!!!', popup)
      popup.style.zIndex = 1;
    })

    //this.sprite.message.on('pointerup', function() {
      
    //});

    this.sprite.user_name = new PIXI.Text("", style);
    this.sprite.user_name.visible = true;

    // link display abilities: 
    this.sprite.share_link = new PIXI.Text("None", style);
    this.sprite.share_link.visible = false;


    this.sprite.share_link.interactive = true;
    this.sprite.share_link.buttonMode = true;
    this.sprite.share_link.addListener('pointerdown', function (e) {
      
      console.log(e);

      const url = self.sprite.share_link.text;
      window.open(url);
    });


    //this.container.addChild(message);

    /*this.sprite.inputbox = new PIXI.TextInput({
      input: {
        fontSize: '36px',
        padding: '12px',
        width: '500px',
        color: '#26272E'
      },
      box: {
        default: {fill: 0xE8E9F3, rounded: 12, stroke: {color: 0xCBCEE0, width: 3}},
        focused: {fill: 0xE1E3EE, rounded: 12, stroke: {color: 0xABAFC6, width: 3}},
        disabled: {fill: 0xDBDBDB, rounded: 12}
      }
    });
    this.sprite.inputbox.placeholder = "Hangouts Invite Link"
    */
    return [this.sprite, this.sprite.message, this.sprite.height, this.sprite.width];
  }
}
