import { computed, defineComponent, PropType } from "vue";
import { NButton, NFlex, NInputGroup, NInputGroupLabel, NInputNumber, NPopover } from "naive-ui";
import { b15ver, gameVersion, selectedADir, version } from "@/store/refs";

// 这是 version 不是 addVersion，是大家都喜欢写 22001 的那个 version
export default defineComponent({
  props: {
    value: Number
  },
  setup(props, {emit}) {
    const value = computed({
      get: () => props.value || 0,
      set: (v) => emit('update:value', v)
    })

    return () => <NInputGroup>
      <NInputNumber showButton={false} class="w-full" v-model:value={value.value} min={0}/>
      {!!version.value?.gameVersion && <>
        {/* 只有成功识别了游戏版本才显示 */}
        {/* 按钮边框层级有问题 */}
        <NButton class={value.value < b15ver.value ? "z-1" : ""} type={value.value < b15ver.value ? 'success' : 'default'} ghost
                 disabled={selectedADir.value === 'A000'} onClick={() => value.value = 20000}>计入 B35</NButton>
        <NButton class={value.value >= b15ver.value ? "z-1" : ""} type={value.value >= b15ver.value ? 'success' : 'default'} ghost
                 disabled={selectedADir.value === 'A000'} onClick={() => value.value = 20000 + version.value!.gameVersion! * 100}>计入 B15</NButton>
      </>}
      <NPopover trigger="hover">
        {{
          trigger: () => <NInputGroupLabel>
            ?
          </NInputGroupLabel>,
          default: () => <div>
            如果游戏版本是
            <span class="c-orange"> 1.{gameVersion.value} </span>
            的话，这里的数字大于等于
            <span class="c-orange"> {b15ver.value} </span>
            就会让歌出现在 B15 里面，否则就会出现在 B35 里面
          </div>
        }}
      </NPopover>
    </NInputGroup>;
  }
})
