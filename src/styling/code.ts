import highlight from "cli-highlight";

export class Code {
  public type = "code";
  private _code: string;
  private _language: string | undefined;

  public constructor(code: string, language?: string) {
    this._code = code;
    this._language = language;
  }

  public value() {
    return this._code;
  }

  public highlight() {
    try {
      this._code = highlight(this._code, { language: this._language });
    } catch (_) {}
    return this;
  }
}
