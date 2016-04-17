const CMC7_REGEX = /^(\d{3})(\d{4})\d(\d{3})(\d{6})\d{13}$/;

export class CMC7Parser {
  constructor(code) {
      let execution = CMC7_REGEX.exec(code.replace(/[^\d]/, ''));
      if (!execution) {
          throw "Could not interpret the check code.";
      }
      this.bank = execution[1];
      this.agency = execution[2];
      this.compensation = execution[3];
      this.number = execution[4];
  }

}
