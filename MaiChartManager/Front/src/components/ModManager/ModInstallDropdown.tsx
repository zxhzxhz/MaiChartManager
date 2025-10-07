import { defineComponent, PropType, ref, computed } from 'vue';
import { NButton, NDropdown, NText } from "naive-ui";
import { globalCapture, modInfo, modUpdateInfo, updateModInfo } from "@/store/refs";
import api from "@/client/api";
import { latestVersion } from './shouldShowUpdateController';

export default defineComponent({
  props: {
    updateAquaMaiConfig: { type: Function, required: true }
  },
  setup(props, { emit }) {
    const installingAquaMai = ref(false)
    const showAquaMaiInstallDone = ref(false)

    const installAquaMai = async (type: string) => {
      console.log(type)
      try {
        // 但是你根本看不到这个加载图标，因为太快了
        installingAquaMai.value = true
        if (type === 'builtin') {
          await api.InstallAquaMai()
        } else {
          const version = modUpdateInfo.value?.find(it => it.type === type);
          if (!version) {
            throw new Error('未找到对应版本');
          }
          const urls = [version.url!];
          if (version.url2) {
            urls.push(version.url2);
          }
          await api.InstallAquaMaiOnline({
            type,
            urls,
            sign: version.sign,
          });
        }
        await updateModInfo()
        await props.updateAquaMaiConfig()
        showAquaMaiInstallDone.value = true
        setTimeout(() => showAquaMaiInstallDone.value = false, 3000);
      } catch (e: any) {
        globalCapture(e, "安装 AquaMai 失败，文件可能被占用了？")
      } finally {
        installingAquaMai.value = false
      }
    }

    return () =>
      <NButton secondary loading={installingAquaMai.value} onClick={() => installAquaMai(latestVersion.value.type)}
        type={showAquaMaiInstallDone.value ? 'success' : 'default'}>
        {showAquaMaiInstallDone.value ? <span class="i-material-symbols-done" /> : modInfo.value?.aquaMaiInstalled ? '重新安装 / 更新' : '安装'}
      </NButton>
  },
});
