export class ConvertUtil {
  static base64ToString(value: string) {
    return Buffer.from(value, 'base64').toString('utf-8');
  }

  static hexToString(value: string) {
    return Buffer.from(value, 'hex').toString('utf-8');
  }
}
