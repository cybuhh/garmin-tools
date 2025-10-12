import * as path from 'path';
import * as os from 'os';

const PATH_SUFFIX = '/Library/Containers/com.whoosh.whooshgame/Data/Library/Application Support/Epic/MyWhoosh/Content/Data';

export function getDataPath() {
  const { homedir } = os.userInfo();

  return path.join(homedir, PATH_SUFFIX);
}
