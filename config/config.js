module.exports = {
    'github': {
        'clientID' : process.env.GITHUB_CLIENTID || '2e89yc2',
        'clientSecret' : process.env.GITHUB_CLIENTSECRET || '2390fyhowebcs'
    },
    'google': {
        'consumerKey' : process.env.GOOGLE_CONSUMERKEY || '0347239649rtyfdsc9',
        'consumerSecret' : process.env.GOOGLE_CONSUMERSECRET || '093fu90eyfgs89ghdfsdf'
    },
    'mongoUri' : process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test',
    'COOKIE_KEY' : process.env.COOKIE_KEY || '9208efyg98wgc987stdc97sgdc'
};