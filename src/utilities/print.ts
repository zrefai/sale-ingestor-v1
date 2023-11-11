import util from 'util';

export function print(data: any) {
  console.log(util.inspect(data, false, null, true));
}
