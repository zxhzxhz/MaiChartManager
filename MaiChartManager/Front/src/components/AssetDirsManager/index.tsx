import { defineComponent, ref } from "vue";
import { NButton, NFlex, NList, NListItem, NModal, NScrollbar, useDialog } from "naive-ui";
import { assetDirs, updateAssetDirs } from "@/store/refs";
import AssetDirDisplay from "@/components/AssetDirsManager/AssetDirDisplay";
import CreateButton from "./CreateButton";
import api from "@/client/api";
import ImportLocalButton from "./ImportLocalButton";

export default defineComponent({
  setup(props) {
    const show = ref(false);

    return () => <NButton secondary onClick={() => show.value = true}>
      Opt 管理

      <NModal
        preset="card"
        class="w-80em max-w-100dvw"
        title="Opt 管理"
        v-model:show={show.value}
      >
        <NFlex vertical size="large">
          <NFlex>
            <CreateButton/>
            <ImportLocalButton/>
          </NFlex>
          <NScrollbar class="h-80vh">
            <NList>
              {assetDirs.value.map(it => <NListItem key={it.dirName!}>
                <AssetDirDisplay dir={it}/>
              </NListItem>)}
            </NList>
          </NScrollbar>
        </NFlex>
      </NModal>
    </NButton>;
  }
})
