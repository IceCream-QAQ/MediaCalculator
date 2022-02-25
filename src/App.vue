<template xmlns:el-col="http://www.w3.org/1999/html">
    <div class="main">
        <p>IceCream 媒体资源计算器 v{{ ui.version }}</p>
        <div class="h"></div>
        <p style="font-size: 12px">支持文件格式: mp3, wav。</p>
        <div class="h"></div>
        <hr color="#eee">
        <div class="h"></div>
        <el-form :model="form" label-width="100px" label-position="left">
            <el-form-item label="文件总数">
                <el-row style="width: 100%">
                    <el-col :span="22">
                        {{ ui.fileNum }}
                    </el-col>
                    <el-col :span="2">
                        <div class="cbc" @mouseleave="cbOut">
                            <div>
                                <el-button
                                    @click="fileList"
                                    class="cb cb1"
                                    icon="files"
                                    circle
                                    @mouseenter="cbIn"
                                    type="info"
                                    plain/>
                            </div>
                            <div>
                                <el-button
                                    @click="addFolder"
                                    class="cb"
                                    :class="{cb2:ui.hoverCB}"
                                    icon="folderAdd"
                                    circle
                                    type="info"
                                    plain/>
                            </div>
                            <div>
                                <el-button
                                    @click="addFile"
                                    class="cb"
                                    :class="{cb3:ui.hoverCB}"
                                    icon="documentAdd"
                                    circle
                                    type="info"
                                    plain/>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item label="计薪算法" @change="count">
                <el-radio-group v-model="form.timeType">
                    <el-radio :label="0">按小时</el-radio>
                    <el-radio :label="1">按分钟</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="超时算法" @change="count">
                <el-radio-group v-model="form.overType">
                    <el-radio :label="0">按比例</el-radio>
                    <el-radio :label="1">四舍五入</el-radio>
                    <el-radio :label="2">抹零</el-radio>
                    <el-radio :label="3">进一</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="单价" @input="money">
                <el-col :span="7">
                    <el-input v-model="form.price">
                        <template #append>元</template>
                    </el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="总时长">
                {{ ui.time }}
            </el-form-item>
            <el-form-item label="总金额">
                {{ ui.money }} 元
            </el-form-item>
            <el-form-item>
                <el-button @click="clear">清空</el-button>
            </el-form-item>
        </el-form>
    </div>
    <el-drawer v-model="ui.fileList" :with-header="false" size="100%">
        <el-page-header icon="ArrowLeft" content="文件列表" @back="ui.fileList = false"/>
        <el-button
            icon="document-copy"
            type="info"
            circle
            plain
            size="small"
            @click="ui.vFile = true"
            style="position: absolute;top: 20px;right: 20px"/>
        <hr color="#eee">
        <div style="overflow: scroll">
            <div v-if="files.length === 0">
                <div style="height: 80px"/>
                <el-empty description="您还没有添加任何文件"></el-empty>
            </div>
            <div v-else class="fic">
                <div class="h"/>
                <el-row class="fit">
                    <el-col :span="12" align="middle" justify="center">
                        文件名
                    </el-col>
                    <el-col :span="4" align="middle" justify="center">
                        &nbsp;
                    </el-col>
                    <el-col :span="4" align="middle" justify="center">
                        文件长度
                    </el-col>
                    <el-col :span="4" align="middle" justify="center">
                        操作
                    </el-col>
                </el-row>
                <el-scrollbar height="490px">
                    <el-row v-for="item in files" class="fileItem">
                        <el-col :span="1" align="middle" justify="end">
                            <el-icon style="padding-top: 7px">
                                <document/>
                            </el-icon>
                        </el-col>
                        <el-col :span="15" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        <span class="fip" :title="item.name">
                            {{ item.name }}
                        </span>
                        </el-col>
                        <el-col :span="4" align="middle" justify="center">
                        <span class="fip">
                            {{ item.time }}
                        </span>
                        </el-col>
                        <el-col :span="4" align="middle" justify="center">
                            <el-popconfirm title="您确定要删除这条记录吗?" @confirm="removeFile(item)">
                                <template #reference>
                                    <el-button icon="delete" size="small" circle type="info" plain></el-button>

                                </template>
                            </el-popconfirm>
                        </el-col>
                    </el-row>
                </el-scrollbar>
            </div>
        </div>
    </el-drawer>
    <el-dialog v-model="ui.vFile" title="请输入虚拟文件时长">
        <el-form :model="vFileForm" label-width="40px">
            <el-form-item label="时">
                <el-input-number v-model="vFileForm.h" min="0"/>
            </el-form-item>
            <el-form-item label="分">
                <el-input-number v-model="vFileForm.m" min="0" max="60"/>
            </el-form-item>
            <el-form-item label="秒">
                <el-input-number v-model="vFileForm.s" min="0" max="60"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="addVFile">添加</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
import {app} from "@tauri-apps/api";

let vFileIndex = 0

function sc(num) {
    if (num < 10) return "0" + num
    else return num.toString()
}

function st(t, n) {
    let r = 0
    switch (t) {
        case 0:
            r = n / 60
            break;
        case 1:
            r = Math.round(n / 60)
            break;
        case 2:
            r = 0
            break;
        case 3:
            r = 1
            break;
    }
    return r
}

function sts(time) {
    let s = Math.round(time / 1000) % 60
    let m = Math.floor(time / 1000 / 60) % 60
    let h = Math.floor(time / 1000 / 60 / 60)

    let hs = sc(h)
    let ms = sc(m)
    let ss = sc(s)

    return hs + ":" + ms + ":" + ss
}

export default {
    data() {
        return {
            form: {
                price: "",
                timeType: 0,
                overType: 0
            },
            ui: {
                version: "",
                hoverCB: false,
                time: "00:00:00",
                fileNum: 0,
                money: 0,
                fileList: false,
                vFile: false
            },
            vFileForm: {
                h: 0,
                m: 0,
                s: 0
            },
            // files: [{
            //     name:"1.wav",
            //     length:600000,
            //     time:"00:10:00"
            // },{
            //     name:"2.wav",
            //     length:600000,
            //     time:"00:10:00"
            // },{
            //     name:"3.wav",
            //     length:600000,
            //     time:"00:10:00"
            // }],
            files: [],
            length: 0,
            num: 0,
        }
    },
    methods: {
        cbIn: function () {
            this.ui.hoverCB = true
        },
        cbOut: function () {
            this.ui.hoverCB = false
        },
        fileList: function () {
            this.cbOut()
            this.ui.fileList = true
        },
        addFolder: async function () {

        },
        addFile: async function () {
            this.cbOut()
            let files = await openFiles()
            for (const file of files) {
                let length = await musicTime(file)
                this.files.push({
                    name: file,
                    length: length,
                    time: sts(length)
                })
            }
            this.time()
        },
        addVFile: function () {
            this.ui.vFile = false
            let length = ((this.vFileForm.h * 60 + this.vFileForm.m) * 60 + this.vFileForm.s) * 1000
            if (length < 1000){
                this.$message({
                    message: '无法添加空文件！',
                    type: 'error',
                })
                return
            }
            this.files.push({
                name: "虚拟文件" + (++vFileIndex),
                length: length,
                time: sts(length)
            })
            this.time()
            this.$message({
                message: '添加虚拟文件成功！',
                type: 'success',
            })
        },
        time: function () {
            let time = 0
            for (const file of this.files) {
                time += file.length
            }
            this.length = time
            this.ui.fileNum = this.files.length

            this.ui.time = sts(time)

            this.count()
        },
        count: function () {
            let time = this.length
            // let ms = time % 1000
            let s = Math.round(time / 1000) % 60
            let m = Math.floor(time / 1000 / 60) % 60
            let h = Math.floor(time / 1000 / 60 / 60)

            let type = this.form.overType
            let timeType = this.form.timeType

            let num = m + st(type, s)
            if (timeType === 0) num = h + st(type, num)
            else num = 60 * h + num

            this.num = num


            this.money()
        },
        money: function () {
            let money = this.num * this.form.price
            money = Math.round(money * 100) / 100
            this.ui.money = money
        },
        clear: function () {
            this.files = []
            this.time()
        },
        removeFile: function (item) {
            let index = this.files.indexOf(item)
            this.files.splice(index, 1)
            this.time()
        }
    },
    async mounted() {
        this.ui.version = await app.getVersion()
        this.time()
    }
}
</script>

<style>
.main {
    padding: 20px;
    margin: 20px;
    border-radius: 5px;
    background: #fff;
    height: 520px;
}

p {
    margin: 0;
}

.h {
    height: 10px;
}

.cbc {
    width: 40px;
    height: 120px;
    transition: top 2s;
    position: absolute;
    top: 0;
    z-index: 800;
}

.cb {
    margin-left: 0;
    position: absolute;
    top: 0;
}

.cb1 {
    z-index: 999;
}

.cb2 {
    top: 40px;
}

.cb3 {
    top: 80px;
}

.fit {
    font-size: 12px;
    color: #ccc;
}

.fic {
    padding: 0 20px;
}

.fileItem {
    height: 35px;
    vertical-align: middle;
    line-height: 35px;
}

.fileItem + .fileItem {
    border-top: #eee 1px dashed;
}

.fip {
    font-size: 14px;
    color: #555;
}

/*.cb:hover{*/
/*    top:80px*/
/*}*/
</style>
