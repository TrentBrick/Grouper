export class Rocket {
  constructor(params) {
    //this.container = new PIXI.Container();
    this.sprite = PIXI.Sprite.fromImage("static/images/rocket.png");
    this.sprite.id = params.id;
    this.sprite.x = params.x;
    this.sprite.y = params.y;
    this.sprite.height = 50;
    this.sprite.width = 50;
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
    this.sprite.message.position.set(params.x.x-8, params.y-8);
    this.sprite.message.visible = false
    //this.sprite.message.anchor.set(0.5);
    this.sprite.message.interactive = true;
    this.sprite.message.buttonMode = true;
    this.sprite.message.addListener('pointerdown', function (e) {
      
      console.log(e);

      const url = "http://hangouts.google.com/start";
      window.open(url);

      //console.log('current text of the message', sprite)
      //self.sprite.message.text= "LINK HAS BEEN CLICKED!!!"

      self.sprite.message.visible = False

      self.sprite.inputbox = new PIXI.TextInput({
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


    })

    //this.sprite.message.on('pointerup', function() {
      
    //});

    this.sprite.user_name = new PIXI.Text("", style);
    this.sprite.user_name.visible = true;

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
