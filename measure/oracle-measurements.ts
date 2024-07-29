
export class OracleMeasurement {

  colorKeyValuePairs(prefixes: string[], values: string[]) {
    const GREEN = "\u001b[32m";
    const RESET = "\u001b[0m";

    let printString = '';
    for (let i = 0; i < prefixes.length; i++) {
      printString += GREEN + prefixes[i] + " " + RESET + values[i] + " ";
    }
    return printString;
  }

  log(prefixes: string[], values: string[]) {
    console.log(this.colorKeyValuePairs(prefixes, values));
  }

  LogDateAndTime() {
    const now = new Date();
    const mst = now.toLocaleString('en-US', { timeZone: 'America/Denver' })

    this.log(['Date & Time:'], [mst + ' MST']);
  }

  LogDuration(start: number, end: number) {
    let ms = end - start;

    const minutes = Math.floor(ms / 60000);
    ms %= 60000;

    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);

    const time = minutes + "m" + seconds + "." + milliseconds + 's';

    this.log(['Time Elapsed:'], [time]);
  }
}

