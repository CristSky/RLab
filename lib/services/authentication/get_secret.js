/**
 * Created by Cristiano on 27/05/2016.
 * cristiano@live.jp
 */
const crypto = require('crypto');
module.exports = (ua) => {
    const hash = crypto.createHash('sha256'),
        _ua = ua || '',
        t = new Date().toLocaleDateString();
    hash.update(process.env.JWT_SECRET + t + _ua);
    return hash.digest('hex');
};

