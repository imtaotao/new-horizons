export class Console {
  public print(item: { value: () => string }) {
    console.log(item.value());
  }
}
