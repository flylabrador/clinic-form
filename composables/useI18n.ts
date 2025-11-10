// composables/useI18n.ts
import { ref, computed, watch } from 'vue'

type Locale = 'zh-TW' | 'en'
const STORAGE_KEY = 'clinic-intake-locale'

const messages: Record<Locale, Record<string, string>> = {
  'zh-TW': {
    appTitle: '心臟內科初診病人問診表9',
    formCardTitle: '基本資料與病史',
    name: '姓名',
    gender: '性別',
    male: '男', female: '女', other: '其他',
    age: '年齡（歲）',
    height: '身高（cm）', weight: '體重（kg）', bmi: 'BMI',
    clinicBP: '診間血壓（mmHg）', sys: '收縮壓', dia: '舒張壓',
    symptom_section: '症狀',
    none: '無', yes: '有',
    duration_value: '發生多久（數值）', unit: '單位',
    frequency: '發作頻率', when: '發作時間（情境）',
    each_episode_value: '每次持續（數值）',
    history1: '過去病史1（請進入勾選）',
    history2: '過去病史2（請進入勾選）',
    familyHistory: '家族病史（請進入勾選）',
    opHistory: '過去手術史', surgeryName: '手術名稱',
    drugAllergy: '藥物過敏', allergyName: '過敏藥物名稱',
    submit: '送出', submitSuccess: '表單送出成功！',
    lang: '語言', theme: '主題', dark: '深色', light: '淺色',
    chestTightness: '胸悶', chestPain: '胸痛', dyspnea: '呼吸喘',
    palpitation: '心悸', dizziness: '暈眩', edema: '水腫',
  },
  en: {
    appTitle: 'Cardiology Intake Form 9',
    formCardTitle: 'Demographics & History',
    name: 'Name',
    gender: 'Gender',
    male: 'Male', female: 'Female', other: 'Other',
    age: 'Age (yrs)',
    height: 'Height (cm)', weight: 'Weight (kg)', bmi: 'BMI',
    clinicBP: 'Clinic BP (mmHg)', sys: 'Systolic', dia: 'Diastolic',
    symptom_section: 'Symptoms',
    none: 'None', yes: 'Yes',
    duration_value: 'Duration (value)',
    unit: 'Unit',
    frequency: 'Frequency',
    when: 'When',
    each_episode_value: 'Each episode (value)',
    history1: 'Past History 1 (select)',
    history2: 'Past History 2 (select)',
    familyHistory: 'Family History (select)',
    opHistory: 'Past Surgery',
    surgeryName: 'Surgery Name',
    drugAllergy: 'Drug Allergy',
    allergyName: 'Allergic Drug',
    submit: 'Submit', submitSuccess: 'Submitted successfully!',
    lang: 'Language', theme: 'Theme', dark: 'Dark', light: 'Light',
    chestTightness: 'Chest Tightness', chestPain: 'Chest Pain',
    dyspnea: 'Dyspnea', palpitation: 'Palpitation',
    dizziness: 'Dizziness', edema: 'Edema',
  }
}

const locale = ref<Locale>((process.client
  ? (localStorage.getItem(STORAGE_KEY) as Locale) : 'zh-TW') || 'zh-TW')

watch(locale, val => { if (process.client) localStorage.setItem(STORAGE_KEY, val) })

export function useI18n() {
  const t = (key: string) => messages[locale.value][key] ?? key
  const current = computed(() => locale.value)
  const setLocale = (l: Locale) => { locale.value = l }
  const locales: Locale[] = ['zh-TW', 'en']
  return { t, current, setLocale, locales }
}
