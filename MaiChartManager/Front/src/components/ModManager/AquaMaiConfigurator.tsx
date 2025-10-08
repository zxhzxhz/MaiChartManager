import { defineComponent, PropType, ref, computed } from 'vue';
import { ConfigDto, IEntryState, ISectionState, Section } from "@/client/apiGen";
import { NAnchor, NAnchorLink, NDivider, NFlex, NForm, NFormItem, NInput, NInputNumber, NScrollbar, NSelect, NSwitch } from "naive-ui";
import _ from "lodash";
import ProblemsDisplay from "@/components/ProblemsDisplay";
import configSortStub from './configSort.yaml'
import { useMagicKeys, whenever } from "@vueuse/core";
import ConfigEntry from './ConfigEntry';
import { getSectionPanelOverride, getNameForPath } from './utils';
import comments from "./modComments.yaml";

const ConfigSection = defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
  },
  setup(props, { emit }) {
    const CustomPanel = getSectionPanelOverride(props.section.path!);

    return () => <NFlex vertical class="p-1 border-transparent border-solid border-1px rd hover:border-yellow-5">
      {!props.section.attribute!.alwaysEnabled && <NFormItem label={getNameForPath(props.section.path!, props.section.path!.split('.').pop()!, props.section.attribute?.comment?.nameZh)} labelPlacement="left" labelWidth="10em" showFeedback={false}
        // @ts-ignore
                                                             title={props.section.path!}
      >
        <NFlex vertical class="w-full ws-pre-line">
          <NFlex class="h-34px" align="center">
            <NSwitch v-model:value={props.sectionState.enabled}/>
            {comments.shouldEnableOptions[props.section.path!] && !props.sectionState.enabled && <ProblemsDisplay problems={['需要开启此选项']}/>}
          </NFlex>
          {comments.commentOverrides[props.section.path!] || props.section.attribute?.comment?.commentZh}
        </NFlex>
      </NFormItem>}
      {props.sectionState.enabled && (
        CustomPanel ?
          <CustomPanel entryStates={props.entryStates} sectionState={props.sectionState} section={props.section}/> :
          !!props.section.entries?.length && <NFlex vertical class="p-l-15">
            {props.section.entries?.filter(it => !it.attribute?.hideWhenDefault || (it.attribute?.hideWhenDefault && !props.entryStates[it.path!].isDefault))
              .map((entry) => <ConfigEntry key={entry.path!} entry={entry} entryState={props.entryStates[entry.path!]}/>)}
          </NFlex>
      )}
    </NFlex>;
  },
});

export default defineComponent({
  props: {
    config: { type: Object as PropType<ConfigDto>, required: true },
    useNewSort: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const search = ref('');
    const searchRef = ref();
    const configSort = computed(() => props.config?.configSort || configSortStub)

    const { ctrl_f } = useMagicKeys({
      passive: false,
      onEventFired(e) {
        if (e.ctrlKey && e.key === 'f' && e.type === 'keydown')
          e.preventDefault()
      },
    })
    whenever(ctrl_f, () => searchRef.value?.select());

    const filteredSections = computed(() => {
      if (!search.value) return props.config.sections;
      const s = search.value.toLowerCase();
      return props.config.sections?.filter(it =>
        it.path?.toLowerCase().includes(s) ||
        it.attribute?.comment?.nameZh?.toLowerCase().includes(s) ||
        it.attribute?.comment?.commentZh?.toLowerCase().includes(s) ||
        it.attribute?.comment?.commentEn?.toLowerCase().includes(s) ||
        it.entries?.some(entry => entry.name?.toLowerCase().includes(s) || entry.path?.toLowerCase().includes(s) ||
          entry.attribute?.comment?.commentZh?.toLowerCase().includes(s) || entry.attribute?.comment?.commentEn?.toLowerCase().includes(s) ||
          entry.attribute?.comment?.nameZh?.toLowerCase().includes(s))
      );
    })

    const bigSections = computed(() => {
      if (props.useNewSort) {
        return Object.keys(configSort.value).filter(it => filteredSections.value!.some(s => configSort.value[it].includes(s.path!)));
      }
      return _.uniq(filteredSections.value!.filter(it => !it.attribute?.exampleHidden).map(s => s.path?.split('.')[0]));
    });

    const otherSection = computed(() => {
      if (!props.useNewSort) return [];
      const knownSections = _.flatten(Object.values(configSort.value) as string[][]);
      return filteredSections.value?.filter(it => !knownSections.includes(it.path!) && !it.attribute!.exampleHidden) || [];
    });

    return () => <div class="grid cols-[14em_auto]">
      <NAnchor type="block" offsetTarget="#scroll">
        {bigSections.value.map((key) => <NAnchorLink key={key} title={key} href={`#${key}`}/>)}
        {otherSection.value.length > 0 && <NAnchorLink key="其他" title="其他" href="#其他"/>}
      </NAnchor>
      <NScrollbar class="h-75vh p-2 relative"
        // @ts-ignore
                  id="scroll"
      >
        <div class={'px-2 absolute top-1 left-2 right-2 z-200'}>
          <NInput v-model:value={search.value} placeholder="搜索" size="small" clearable ref={searchRef}/>
        </div>
        {bigSections.value.map((big) => <div id={big} key={big}>
          <NDivider titlePlacement="left" class="mt-0! pt-8">{big}</NDivider>
          {filteredSections.value?.filter(it => {
            if (props.useNewSort) {
              return configSort.value[big!].includes(it.path!);
            }
            return it.path!.split('.')[0] === big && !it.attribute!.exampleHidden;
          }).sort((a, b) => {
            if (!props.useNewSort) return 0;
            return configSort.value[big!].indexOf(a.path!) - configSort.value[big!].indexOf(b.path!);
          }).map((section) => {
            return <ConfigSection key={section.path!} section={section}
                                  entryStates={props.config.entryStates!}
                                  sectionState={props.config.sectionStates![section.path!]}/>;
          })}
        </div>)}
        {otherSection.value.length > 0 &&
          <div id={"其他"}>
            <NDivider titlePlacement="left" class="mt-2!">其他</NDivider>
            {otherSection.value.map((section) =>
              <ConfigSection key="其他" section={section}
                             entryStates={props.config.entryStates!}
                             sectionState={props.config.sectionStates![section.path!]}/>)}
          </div>}
      </NScrollbar>
    </div>;
  },
});
