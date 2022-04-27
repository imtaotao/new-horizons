import c from "picocolors";

type StyleMethods = Record<PicocolorsStyleMethod, () => Text>;

type PicocolorsStyleMethod = Exclude<
  keyof typeof c,
  "isColorSupported" | "createColors"
>;

export class Text implements StyleMethods {
  private _msg: string;
  public type = "text";

  public bold: () => Text;
  public blackBright: () => Text;
  public redBright: () => Text;
  public greenBright: () => Text;
  public yellowBright: () => Text;
  public blueBright: () => Text;
  public magentaBright: () => Text;
  public cyanBright: () => Text;
  public whiteBright: () => Text;
  public bgBlackBright: () => Text;
  public bgRedBright: () => Text;
  public bgGreenBright: () => Text;
  public bgYellowBright: () => Text;
  public bgBlueBright: () => Text;
  public bgMagentaBright: () => Text;
  public bgCyanBright: () => Text;
  public bgWhiteBright: () => Text;
  public reset: () => Text;
  public dim: () => Text;
  public italic: () => Text;
  public underline: () => Text;
  public inverse: () => Text;
  public hidden: () => Text;
  public strikethrough: () => Text;
  public black: () => Text;
  public red: () => Text;
  public green: () => Text;
  public yellow: () => Text;
  public blue: () => Text;
  public magenta: () => Text;
  public cyan: () => Text;
  public white: () => Text;
  public gray: () => Text;
  public bgBlack: () => Text;
  public bgRed: () => Text;
  public bgGreen: () => Text;
  public bgYellow: () => Text;
  public bgBlue: () => Text;
  public bgMagenta: () => Text;
  public bgCyan: () => Text;
  public bgWhite: () => Text;

  public constructor(msg: string) {
    this._msg = msg;
    const methods = Object.keys(c) as (keyof typeof c)[];
    methods.forEach((method) => {
      if (method !== "isColorSupported" && method !== "createColors") {
        this[method] = () => this._transformer(method);
      }
    });
  }

  private _transformer(method: PicocolorsStyleMethod) {
    try {
      this._msg = c[method](this._msg);
    } catch (_) {}
    return this;
  }

  public value() {
    return this._msg;
  }
}
