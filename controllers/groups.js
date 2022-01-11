const Groups = require('../models/groups');
const User = require('../models/users');
const Schema = require('mongoose').Schema;
const { validationResult } = require('express-validator/check');

exports.postCreateGroup = async (req, res, next) => {
    const name = req.body.name;
    const userId = req.userId;
    try {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error();
            err.statusCode = 422;
            err.message = errors.array()[0].msg;
            throw err;
        }
        const user = await User.findById(userId);
        if(!user) {
            const error = new Error('No such user exists!!');
            throw error;
        }
        const group = new Groups({
            name: name,
            items: [],
            members: [userId],
            creator: userId
        });
        const createdGroup = await group.save();
        user.groups.push(createdGroup);
        await user.save();
        return res.status(200).json({
            message: 'Group created successfully',
            group: createdGroup
        });
    } catch(err) {
        next(err);
    }
};

exports.getAllGroup = async(req, res, next) => {
    const userId = req.userId;
    try{
        groups = await Groups.find({ members: { '$in': [userId] } })
                .populate('creator')
                .populate('members');
        let returnGroup = groups.map((group) => {
            return {
                ...group._doc,
                members: group.members.map((member) => {
                    return {
                        Name: member.name,
                        Phone: member.phone
                    }
                }),
                creator: group.creator.email
            }
        });
        return res.status(200).json({
            message: 'Groups retrieved successfully',
            groups: returnGroup
        });
    }catch(err) {
        next(err);
    }
};

exports.addItem = async(req, res, next) => {
    try{
        const groupId = req.body.groupId;
        const itemName = req.body.item;
        const group = await Groups.findById(groupId);
        if(!group) {
            throw new Error('No such group exists');
        }
        if(group.items.indexOf(itemName) > -1) {
            const err = new Error();
            err.statusCode = 409;
            err.message = 'Item already exists';
            throw err;
        }
        group.items.push(itemName);
        await group.save();
        return res.status(200).json({
            message: 'Item added'
        });
    }catch(err) {
        next(err);
    }
};

exports.getItems = async(req, res, next) => {
    try{
        const groupId = req.params.id;
        const group = await Groups.findById(groupId);
        if(!group) {
            const err = new Error();
            err.statusCode = 402;
            err.message = 'No group exists';
            throw err;
        }
        return res.status(200).json({
            items: group.items
        });
    }catch(err) {
        next(err);
    }
}

exports.deleteItem = async(req, res, next) => {
    try{
        const groupId = req.body.groupId;
        const itemName = req.body.item;
        const group = await Groups.findById(groupId);
        if (!group) {
            const err = new Error();
            err.statusCode = 402;
            err.message = 'No group exists';
            throw err;
        }
        if(group.items.indexOf(itemName) < -1) {
            const err = new Error();
            err.statusCode = 402;
            err.message = 'Item not exists';
            throw err;
        }
        group.items.splice(group.items.indexOf(itemName), 1);
        await group.save();
        return res.status(200).json({
            message: 'Deleted successfully'
        });
    }catch(err) {
        next(err);
    }
}

exports.updateItem = async(req, res, next) => {
    try{
        const groupId = req.body.groupId;
        const oldName = req.body.oldName;
        const newName = req.body.newName;
        const group = await Groups.findById(groupId);
        if (!group) {
            const err = new Error();
            err.statusCode = 402;
            err.message = 'No group exists';
            throw err;
        }
        if (group.items.indexOf(oldName) < -1) {
            const err = new Error();
            err.statusCode = 402;
            err.message = "Can't modify the name";
            throw err;
        }
        group.items.splice(group.items.indexOf(oldName), 1);
        group.items.push(newName);
        await group.save();
        return res.status(200).json({
            message: 'Updated successfully'
        });
    }catch(err) {
        next(err);
    }
}

exports.joinGroup = async(req, res, next) => {
    try{
        const groupId = req.body.groupId;
        const userId = req.userId;
        const group = await Groups.findById(groupId);
        if (!group) {
            const err = new Error();
            err.statusCode = 402;
            err.message = 'No group exists';
            throw err;
        }
        if (group.members.indexOf(userId) > -1) {
            const err = new Error();
            err.statusCode = 400;
            err.message = 'Already joined the group';
            throw err;
        }
        group.members.push(userId);
        const savedGroup = await group.save();
        const user = await User.findById(userId);
        user.groups.push(savedGroup);
        await user.save();
        return res.status(200).json({
            message: 'User joined group successfully'
        });
    }catch(err) {
        next(err);
    }
};

exports.delete = async(req, res, next) => {
    try{
        const groupId = req.params.groupId;
        const userId = req.userId;
        const group = await Groups.findById(groupId);
        if (!group) {
            const err = new Error();
            err.statusCode = 402;
            err.message = 'No group exists';
            throw err;
        }
        if(group.creator.toString() !== userId) {
            const err = new Error();
            err.statusCode = 401;
            err.message = 'Not authenticated';
            throw err;
        }
        const members = group.members;
        await Groups.deleteOne({_id: groupId});
        for (let index = 0; index < members.length; index++) {
            const user = await User.findById(members[index]);
            user.groups.splice(user.groups.indexOf(groupId), 1);
            await user.save();
        }
        return res.status(200).json({
            message: 'Group deleted successfully'
        });

    }catch(err) {
        next(err);
    }
}

exports.leaveGroup = async(req, res, next) => {
    try{
        const groupId = req.body.groupId;
        const userId = req.userId;
        const group = await Groups.findById(groupId);
        if (!group) {
            const err = new Error();
            err.statusCode = 402;
            err.message = 'No group exists';
            throw err;
        }
        group.members.splice(group.members.indexOf(userId), 1);
        await group.save();
        const user = await User.findById(userId);
        user.groups.splice(user.groups.indexOf(groupId), 1);
        await user.save();
        return res.status(200).json({
            message: 'Left group successfully'
        });
    }catch(err) {
        next(err);
    }
}

exports.modifyName = async(req, res, next) => {
    try{
        const groupId = req.body.groupId;
        const newName = req.body.newName;
        const userId = req.userId;
        const group = await Groups.findById(groupId);
        if (!group) {
            const err = new Error();
            err.statusCode = 401;
            err.message = 'No group exists';
            throw err;
        }
        if(group.creator.toString() !== userId) {
            const err = new Error();
            err.statusCode = 401;
            err.message = 'Not authenticated';
            throw err;
        }
        const allGroups = await Groups.find({creator: userId});
        let isAvailable;
        for(let index = 0; index < allGroups.length; index++) {
            if(allGroups[index].name === newName) {
                isAvailable = true;
                break;
            }
        }
        if(isAvailable) {
            const err = new Error();
            err.statusCode = 409;
            err.message = 'Group name already existing';
            throw err;
        }
        group.name = newName;
        await group.save();
        return res.status(200).json({
            message: 'Updated group name successfully'
        });
    }catch(err) {
        next(err);
    }
}

exports.getMembers = async(req, res, next) => {
    try{
        const groupId = req.params.groupId;
        const group = await Groups.findById(groupId)
                      .populate('members');
        if (!group) {
            const err = new Error();
            err.statusCode = 401;
            err.message = 'No group exists';
            throw err;
        }
        const members = group.members.map((member) => {
            return {
                name: member.name,
                phone: member.phone
            }
        });
        return res.status(200).json({
            message: 'Retrieved members data',
            members: members
        });
    }catch(err) {
        next(err);
    }
}