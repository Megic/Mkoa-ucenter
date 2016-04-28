/**
* Created by Mkoa
*/
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('memberExtend',{
                mid: {
                        type: DataTypes.INTEGER,
                        allowNull:false,
                        defaultValue:'0',
                        unique:false,
                        comment: '用户ID'
                      },
                json_data: {
                        type: DataTypes.JSON,
                        allowNull:false,
                        defaultValue:'0',
                        unique:false,
                        comment: '用户扩展信息'
                      }}, {
        tableName:'mkoa_memberExtend',
        comment: '用户资料扩展表',
        timestamps:true,
        indexes:[],
        paranoid:false,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });
};