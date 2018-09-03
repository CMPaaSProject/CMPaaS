module.exports = app => {
    const userModel = require('mongoose').model('User');
    const mapModel = require('mongoose').model('Map');
    const versionModel = require('mongoose').model('Version');

    const api = {};
    const error = app.errors.users;

    api.me = (req, res) => {
        res.json(req.user);
    }

    api.dashboard = (req, res) => {
        mapModel
            .find({"author._id": req.user._id})
            .sort({'last_update':-1})
            .limit(3)
            .then(maps => {
                maps.forEach((m, i) => {
                    maps[i].versions.forEach((v, j) => {
                        versionModel
                            .findById(v._id)
                            .then(version => {
                                maps[i].versions[j] = version;
                                if((i == maps.length - 1) && (j == maps[i].versions.length - 1)) res.json(maps);
                            });
                    });
                });
            });
    };

    api.myMaps = (req, res) => {
        let order = {};
        req.query.orderBy ? order[req.query.orderBy] = -1 : order = {};
        mapModel
            .find({"author._id": req.user._id})
            .sort(order)
            .limit(Number(req.query.limit))
            .then(maps => res.json(maps), error => console.log(error));  
    }

    api.myVersions = (req, res) => {
        versionModel
            .find({"map._id":{ $in: req.query.mapId }})
            .sort({last_update: -1})
            .then(versions => {
                res.json(versions);
            });
    }


    return api;
}