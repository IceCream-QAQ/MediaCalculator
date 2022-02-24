import {createApp} from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as icons from '@element-plus/icons-vue'
import {invoke} from "@tauri-apps/api/tauri";
import {dialog} from "@tauri-apps/api";


function print(message) {
    invoke('print', {message: message})
}

async function musicTime(path) {
    return await invoke('music_time', {path: path})
}

async function openFiles(){
    return await dialog.open({
        multiple: true,
        filters: [{
            name: "音频文件",
            extensions: ["wav", "mp3"]
        }]
    })
}

async function openFolder(){
    return await dialog.open({
        directory: true,
        filters: [{
            name: "音频文件",
            extensions: ["wav", "mp3"]
        }]
    })
}

window.printR = print
window.musicTime = musicTime
window.openFiles = openFiles
window.openFolder = openFolder


let app = createApp(App)
Object.keys(icons).forEach(key => {
    let c
    switch (key) {
        case "Menu":
            c = "icon-menu"
            break
        default:
            c = key
    }
    app.component(c, icons[key])
})

app.use(ElementPlus).mount('#app')
