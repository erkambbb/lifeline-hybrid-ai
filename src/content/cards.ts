import type { Lang } from "../i18n";
import type { SourceId } from "./sources";

/**
 * Şiddet, rengi ve öncelik sırasını belirler.
 * life: dakikalar önemli. urgent: hızlı müdahale gerekir. safety: güvenlik bilgisi.
 */
export type Severity = "life" | "urgent" | "safety";

type Text = Record<Lang, string>;
type TextList = Record<Lang, string[]>;

export interface Card {
  id: string;
  severity: Severity;
  title: Text;
  steps: TextList;
  warnings: TextList;
  sources: SourceId[];
  /** Modele verilen tek satırlık tanım. Model yalnızca bu listeden seçim yapar. */
  hint: string;
  /**
   * Yerel arama sözcükleri, Türkçe karakterler sadeleştirilmiş halde.
   * Düz sözcük, kelime başından eşleşir ("kaniyor" -> "kaniyorum").
   * Sonu $ olan sözcük tam eşleşir ("kan$", "kanepe" ile eşleşmez).
   */
  keywords: string[];
}

// NEDEN model metin üretmiyor: Sağlık talimatı uydurulamaz. Bu kartları insanlar
// yazar, model yalnızca durumu anlayıp kart kimliği seçer.
// SIRA ÖNEMLİ: Puan eşitse listede önce gelen kart kazanır.
export const CARDS: Card[] = [
  {
    id: "trapped",
    severity: "life",
    title: { tr: "Enkaz altındayım", en: "I am trapped under rubble" },
    steps: {
      tr: [
        "Sakin kal. Enerjini koru, gereksiz hareket etme.",
        "Ağzını ve burnunu bezle veya giysinle kapat.",
        "Boruya, duvara veya zemine vur. Düdüğün varsa çal.",
        "Birkaç dakikada bir üç kez sertçe vur. Hemen bağırma, toz yutarsın.",
        "Sinyal varsa kısa mesaj gönder.",
        "Kurtarma ekiplerinin sesini duyunca seslen.",
      ],
      en: [
        "Stay calm. Save your energy and avoid unnecessary movement.",
        "Cover your mouth and nose with cloth or clothing.",
        "Tap on a pipe, wall, or floor. Use a whistle if you have one.",
        "Knock hard three times every few minutes. Do not shout at first, or you will breathe in dust.",
        "If you have signal, send a text message.",
        "Call out when you hear rescuers.",
      ],
    },
    warnings: {
      tr: ["Kibrit veya çakmak yakma.", "Tozu kaldıracak hareketler yapma."],
      en: ["Do not light a match or lighter.", "Do not move in ways that kick up dust."],
    },
    sources: ["akom", "cdc", "redcross"],
    hint: "The person is trapped, pinned, or stuck under rubble or debris.",
    keywords: [
      "enkaz", "sikis", "mahsur", "altinda kal", "gocuk", "cikamiyorum", "kapali kaldim",
      "trapped", "rubble", "debris", "stuck", "pinned", "buried",
    ],
  },
  {
    id: "bleeding",
    severity: "life",
    title: { tr: "Ağır kanama", en: "Severe bleeding" },
    steps: {
      tr: [
        "Yaraya hemen elinle bastır. Temiz bir bez varsa onu kullan.",
        "Kişinin uzanmasına yardım et.",
        "112'yi ara.",
        "Bez kanla ıslanırsa çıkarma. Üstüne ikinci bezi koy, daha sert bastır.",
        "Kol veya bacak kanaması durmuyorsa ve turnike varsa turnike uygula.",
        "Kişiyi sırt üstü yatır ve giysiyle sıcak tut.",
      ],
      en: [
        "Press directly on the wound with your hand. Use a clean cloth if you have one.",
        "Help the person to lie down.",
        "Call 112.",
        "If blood soaks through, do not remove the cloth. Add a second one on top and press harder.",
        "If an arm or leg keeps bleeding and you have a tourniquet, apply it.",
        "Keep the person on their back and warm them with clothing.",
      ],
    },
    warnings: {
      tr: ["Turnikeyi uyguladıktan sonra sağlık ekibi gelene kadar gevşetme."],
      en: ["Once a tourniquet is on, keep it in place until medical help arrives."],
    },
    sources: ["ifrc"],
    hint: "Heavy bleeding from a wound or deep cut.",
    keywords: ["kaniyor", "kanama", "kaniyo", "kan$", "kan akiyor", "kan geliyor", "kesik", "bleed", "blood", "deep cut"],
  },
  {
    id: "not-breathing",
    severity: "life",
    title: { tr: "Tepkisiz ve nefes almıyor", en: "Unresponsive and not breathing" },
    steps: {
      tr: [
        "112'yi ara, telefonu hoparlöre al. Yanında biri varsa onun aramasını iste.",
        "Hemen göğüs basısına başla. Göğsün tam ortasına iki elinle bastır.",
        "Hızlı ve düzenli bas: dakikada 100 ile 120 bası.",
        "Yardım gelene kadar durma.",
        "Kişi öksürür, gözünü açar, konuşur veya normal nefes alırsa dur.",
      ],
      en: [
        "Call 112 and use the speaker. If someone is with you, ask them to call.",
        "Start chest compressions now. Push on the centre of the chest with both hands.",
        "Push fast and steadily: 100 to 120 compressions per minute.",
        "Do not stop until help arrives.",
        "Stop if the person coughs, opens their eyes, speaks, or breathes normally.",
      ],
    },
    warnings: {
      tr: [
        "Nefesin normal olduğundan emin değilsen normal değil kabul et.",
        "Yanında biri varsa 1-2 dakikada bir sırayla bas.",
      ],
      en: [
        "If you are not sure that breathing is normal, assume it is not.",
        "If someone can help, swap every 1 to 2 minutes.",
      ],
    },
    sources: ["ifrc"],
    hint: "Another person does not respond and is not breathing normally, or their heart stopped.",
    keywords: [
      "nefes almiyor", "nefes alamiyor$", "nefesi yok", "nefesi durdu", "soluk almiyor", "kalbi durdu", "kalp masaji",
      "not breathing", "stopped breathing", "no pulse", "cpr", "heart stopped",
    ],
  },
  {
    id: "unresponsive",
    severity: "life",
    title: { tr: "Tepkisiz ama nefes alıyor", en: "Unresponsive but breathing" },
    steps: {
      tr: [
        "Kişiyi yan yatır ve başını geriye eğ. Bu, nefes yolunu açık tutar.",
        "112'yi ara.",
        "Nefesini ve tepkisini sürekli izle.",
        "Nefesi durursa veya hırıltılı olursa hemen göğüs basısına başla.",
      ],
      en: [
        "Roll the person onto their side and tilt their head back. This keeps the airway open.",
        "Call 112.",
        "Keep watching their breathing and response.",
        "If breathing stops or turns into gasping, start chest compressions at once.",
      ],
    },
    warnings: {
      tr: [
        "Düşme veya çökme sonrasıysa omurga zarar görmüş olabilir. Kişiyi bulduğun gibi bırak, başını nazikçe destekle.",
      ],
      en: [
        "After a fall or a collapse, the spine may be hurt. Leave the person as you found them and gently support their head.",
      ],
    },
    sources: ["ifrc"],
    hint: "Another person is unconscious or fainted but is breathing.",
    keywords: [
      "bayildi", "bayiliyor", "bilinci kapali", "bilinci yerinde degil", "kendinde degil", "uyanmiyor", "tepki vermiyor",
      "unconscious", "unresponsive", "fainted", "passed out",
    ],
  },
  {
    id: "choking",
    severity: "life",
    title: { tr: "Boğazına bir şey kaçtı", en: "Choking" },
    steps: {
      tr: [
        "Öksürebiliyorsa öksürmesini söyle ve yanında kal.",
        "Öksüremiyor, konuşamıyor veya nefes alamıyorsa kürek kemiklerinin arasına 5 kez sertçe vur.",
        "Çıkmazsa 5 karın itmesi yap: yumruğunu göbekle kaburgalar arasına koy, içeri ve yukarı çek.",
        "Yine çıkmazsa 112'yi ara.",
        "Engel çıkana veya kişi tepkisiz kalana kadar 5 vuruş ve 5 itmeyi sürdür.",
      ],
      en: [
        "If the person can cough, tell them to keep coughing and stay with them.",
        "If they cannot cough, speak, or breathe, give 5 firm blows between the shoulder blades.",
        "If that fails, give 5 abdominal thrusts: fist between ribs and belly button, pull in and up.",
        "If it still fails, call 112.",
        "Keep alternating 5 blows and 5 thrusts until it clears or the person becomes unresponsive.",
      ],
    },
    warnings: {
      tr: [
        "Kişi tepkisiz kalırsa göğüs basısına başla.",
        "Ağzına körlemesine parmak sokma. Yalnızca görebildiğin katı cismi çıkar.",
      ],
      en: [
        "If the person becomes unresponsive, start chest compressions.",
        "Do not sweep the mouth blindly. Remove only a solid object that you can see.",
      ],
    },
    sources: ["ifrc"],
    hint: "Airway blocked by an object or food; the person cannot breathe, cough, or speak.",
    keywords: ["bogul", "bogazina", "tikandi", "tikaniyor", "oksuremiyor", "nefes alamiyorum", "chok", "cannot breathe", "can't breathe"],
  },
  {
    id: "shock",
    severity: "life",
    title: { tr: "Şok belirtileri", en: "Signs of shock" },
    steps: {
      tr: [
        "Kişinin sırt üstü uzanmasına yardım et.",
        "Nedenine müdahale et. Örneğin kanamaya bastır.",
        "112'yi ara.",
        "Battaniye veya giysiyle sıcak tut. Soğuksa yerden koru.",
        "Konuşarak sakinleştir. Nefesini ve tepkisini izle.",
      ],
      en: [
        "Help the person to lie down on their back.",
        "Treat the cause if you can. For example, press on a bleeding wound.",
        "Call 112.",
        "Keep them warm with a blanket or clothing. Protect them from cold ground.",
        "Talk to them calmly. Watch their breathing and response.",
      ],
    },
    warnings: {
      tr: ["Kişi tepkisiz kalır ve nefesi bozulursa göğüs basısına başla."],
      en: ["If the person becomes unresponsive with abnormal breathing, start chest compressions."],
    },
    sources: ["ifrc"],
    hint: "Pale, cold, sweaty, or weak after an injury or blood loss; failing circulation.",
    keywords: ["sok$", "soka girdi", "soguk terle", "benzi soldu", "shock$", "clammy"],
  },
  {
    id: "gas",
    severity: "urgent",
    title: { tr: "Gaz kokusu", en: "Gas smell" },
    steps: {
      tr: [
        "Gaz vanasını kapat.",
        "Kapı ve pencereleri aç.",
        "Binadan hemen çık ve uzaklaş.",
        "Dışarı çıkınca 112'yi ara.",
      ],
      en: [
        "Shut off the gas valve.",
        "Open the doors and windows.",
        "Leave the building now and move away.",
        "Call 112 once you are outside.",
      ],
    },
    warnings: {
      tr: [
        "Kibrit, çakmak veya elektrik düğmesi kullanma.",
        "Telefonu içeride kullanma.",
        "Gazı kendin yeniden açma. Yetkililer izin vermeden içeri girme.",
      ],
      en: [
        "Do not use matches, lighters, or light switches.",
        "Do not use a phone inside.",
        "Do not turn the gas back on yourself. Stay out until officials say it is safe.",
      ],
    },
    sources: ["akom", "cdc"],
    hint: "Smell of gas or a suspected gas leak.",
    keywords: ["gaz kok", "gaz kac", "gaz sizint", "gaz var", "dogalgaz", "tup kok", "gas$", "gas leak"],
  },
  {
    id: "burn",
    severity: "urgent",
    title: { tr: "Yanık", en: "Burn" },
    steps: {
      tr: [
        "Yanığı temiz akan suyla en az 10 dakika, mümkünse 20 dakika soğut.",
        "Yanık büyük, derin veya yüz, ağız, boğaz ve cinsel bölgedeyse 112'yi ara.",
        "Deriye yapışmamışsa yanık çevresindeki giysi ve takıları çıkar.",
        "Soğutunca nemli ve yapışmayan bir örtüyle kapat. Yoksa ıslak bez veya streç film kullan.",
        "Kişiyi sakinleştir, nefesini ve tepkisini izle.",
      ],
      en: [
        "Cool the burn with clean running water for at least 10 minutes, ideally 20.",
        "Call 112 if the burn is large, deep, or on the face, mouth, throat, or genitals.",
        "Remove clothing and jewellery near the burn unless they are stuck to the skin.",
        "After cooling, cover it with a moist non-stick dressing, a wet cloth, or cling film.",
        "Reassure the person and watch their breathing and response.",
      ],
    },
    warnings: {
      tr: ["Buz veya buz gibi su kullanma.", "Su toplamış yerleri patlatma."],
      en: ["Do not use ice or ice-cold water.", "Do not burst blisters."],
    },
    sources: ["ifrc"],
    hint: "Skin burned by fire, heat, or hot liquid.",
    keywords: ["yandi", "yanik", "yaniyor", "haslandi", "kaynar su", "burn", "scald"],
  },
  {
    id: "fracture",
    severity: "urgent",
    title: { tr: "Kırık, çıkık veya burkulma", en: "Fracture, dislocation, or sprain" },
    steps: {
      tr: [
        "Yaralı yeri hareket ettirmemesine yardım et.",
        "Hareket etmeyecek şekilde, rahat bir pozisyonda destekle.",
        "Soğuk bir şey varsa en fazla 20 dakika uygula.",
        "Ağrı veya şişlik çoksa ya da uzuv şekilsizse 112'yi ara.",
        "Kişiyi sakinleştir ve rahat ettir.",
      ],
      en: [
        "Help the person to keep the injury still.",
        "Support it in a comfortable position so that it cannot move.",
        "If you have something cold, apply it for up to 20 minutes.",
        "Call 112 if there is a lot of pain or swelling, or if the limb looks abnormal.",
        "Reassure the person and keep them comfortable.",
      ],
    },
    warnings: {
      tr: ["Kemik deriden çıktıysa kanamaya da dikkat et. Kırığı düzeltmeye çalışma."],
      en: ["If bone breaks the skin, also watch for bleeding. Do not try to straighten the injury."],
    },
    sources: ["ifrc"],
    hint: "Broken bone, dislocation, or sprain in an arm, leg, hand, or foot.",
    keywords: ["kirildi", "kirik", "kirdi", "burkul", "cikik", "broken", "fracture", "sprain", "dislocat"],
  },
  {
    id: "head-spine",
    severity: "urgent",
    title: { tr: "Baş, boyun veya sırt yaralanması", en: "Head, neck, or back injury" },
    steps: {
      tr: [
        "Kişiden olabildiğince kıpırdamadan durmasını iste.",
        "112'yi ara.",
        "Gerekirse başını nazikçe destekle, boynu hareket etmesin.",
        "Nefesini ve tepkisini sürekli izle.",
      ],
      en: [
        "Ask the person to stay as still as possible.",
        "Call 112.",
        "If needed, gently support their head so that the neck does not move.",
        "Keep watching their breathing and response.",
      ],
    },
    warnings: {
      tr: [
        "Yakın bir tehlike yoksa kişiyi hareket ettirme.",
        "Taşımak zorundaysan en az iki kişi olun. Biri başı omurgayla aynı hizada tutsun.",
      ],
      en: [
        "Do not move the person unless there is immediate danger.",
        "If you must move them, use at least two people. One keeps the head in line with the spine.",
      ],
    },
    sources: ["ifrc"],
    hint: "Injury to the head, neck, or spine, or a heavy blow or fall.",
    keywords: [
      "basim", "basini", "basina", "kafam", "kafasi", "boyun", "boynum", "omurga", "belim", "sirtim", "felc", "hissetmiyorum",
      "head injury", "hit my head", "concussion", "spine", "neck",
    ],
  },
  {
    id: "cold",
    severity: "urgent",
    title: { tr: "Aşırı üşüme", en: "Severe cold" },
    steps: {
      tr: [
        "Kişiyi soğuktan uzaklaştır veya daha fazla üşümesini önle.",
        "Islak giysileri çıkar, varsa nazikçe kurula, battaniyeyle ört.",
        "Tepki veriyor ve titriyorsa uyku tulumu veya battaniyeyle ısınsın.",
        "Yutabiliyorsa sıcak, şekerli bir içecek veya enerji veren bir yiyecek ver.",
        "Sakinleştir. Nefesini ve tepkisini izle.",
      ],
      en: [
        "Move the person away from the cold, or stop them cooling further.",
        "Remove wet clothes, dry them gently, and cover them with a blanket.",
        "If they respond and shiver, let them warm up in a sleeping bag or blanket.",
        "If they can swallow, give a warm sugary drink or high-energy food.",
        "Reassure them. Watch their breathing and response.",
      ],
    },
    warnings: {
      tr: ["Derisini ovma.", "Sıcak taş gibi şeyleri doğrudan deriye koyma."],
      en: ["Do not rub the skin.", "Do not put hot objects directly on the skin."],
    },
    sources: ["ifrc"],
    hint: "Dangerously cold, hypothermia, shivering after exposure.",
    keywords: ["donuyor", "donuyorum", "usuyor", "usudu", "titriyor", "hipotermi", "hypotherm", "freezing", "shiver", "very cold"],
  },
  {
    id: "shaking",
    severity: "safety",
    title: { tr: "Deprem şu an oluyor", en: "The earthquake is happening now" },
    steps: {
      tr: [
        "Bulunduğun yerde kal. Başka odaya veya dışarı kaçma.",
        "Çök: dizlerinin üzerine çök.",
        "Kapan: sağlam bir masanın altına gir veya sağlam bir eşyanın yanında başını ve enseni koru.",
        "Tutun: sarsıntı bitene kadar sabit bir yere tutun.",
      ],
      en: [
        "Stay where you are. Do not run to another room or outside.",
        "Drop onto your knees.",
        "Cover your head and neck under a sturdy table or next to a solid object.",
        "Hold on to something fixed until the shaking stops.",
      ],
    },
    warnings: { tr: [], en: [] },
    sources: ["afad", "akom"],
    hint: "The ground is shaking right now.",
    keywords: ["deprem oluyor", "deprem var", "sallaniyor", "sarsiliyor", "sallantı", "shaking", "earthquake now", "happening now"],
  },
  {
    id: "after-quake",
    severity: "safety",
    title: { tr: "Sarsıntı durdu, şimdi ne yapmalıyım?", en: "The shaking stopped, what now?" },
    steps: {
      tr: [
        "Kendini kontrol et. Yaran var mı bak.",
        "Bina güvenli değilse afet çantanı alıp dışarı çık.",
        "Hasarlı binaya girme. Tuhaf ses duyarsan binadan uzaklaş.",
        "Artçı sarsıntıya hazır ol. Yine çök, kapan, tutun.",
      ],
      en: [
        "Check yourself for injuries.",
        "If the building is not safe, take your emergency bag and leave.",
        "Do not enter a damaged building. If you hear unusual noises, move away.",
        "Expect aftershocks. Drop, cover, and hold on again.",
      ],
    },
    warnings: {
      tr: ["Gaz sızıntısı olmadığından emin olana kadar kibrit, çakmak veya elektrik düğmesi kullanma."],
      en: ["Do not use matches, lighters, or light switches until you are sure that there is no gas leak."],
    },
    sources: ["akom", "cdc"],
    hint: "The shaking has stopped; the person asks what to do next, or asks about aftershocks or damage.",
    keywords: [
      "deprem bitti", "sarsinti durdu", "deprem sonrasi", "artci", "bina hasarli", "catlak", "ne yapmaliyim",
      "aftershock", "after the earthquake", "shaking stopped", "what now",
    ],
  },
  {
    id: "help-others",
    severity: "safety",
    title: { tr: "Başkasına yardım etmek istiyorum", en: "I want to help someone else" },
    steps: {
      tr: [
        "Önce kendini kontrol et. Yaralı değilsen yardım et.",
        "Hasarlı binaya girme.",
        "112'yi ara. Yerini ve duyduğun sesleri anlat.",
        "Kurtarma ekiplerine kişinin yerini göster.",
        "Ağır yaralıyı yakın bir tehlike yoksa hareket ettirme.",
      ],
      en: [
        "Check yourself first. If you are not hurt, help others.",
        "Do not enter a damaged building.",
        "Call 112. Tell them the location and what you can hear.",
        "Show rescuers where the person is.",
        "Do not move a seriously injured person unless there is immediate danger.",
      ],
    },
    warnings: { tr: [], en: [] },
    sources: ["cdc", "ifrc"],
    hint: "The person wants to help someone else, or hears someone trapped nearby.",
    keywords: ["ses geliyor", "sesini duyuyorum", "biri kaldi", "kurtar", "yardim etmek", "someone trapped", "rescue", "help someone"],
  },
  {
    id: "distress",
    severity: "safety",
    title: { tr: "Çok korkuyorum, panik oldum", en: "I am very scared and panicking" },
    steps: {
      tr: [
        "Mümkünse güvenli bir yere geç.",
        "Yalnız kalma. Yanındakilerle konuş.",
        "Su, yiyecek ve battaniye gibi temel ihtiyaçlara bak.",
        "Bilgiyi yetkililerden al. Yardım gelene kadar yanındakileri yalnız bırakma.",
      ],
      en: [
        "Move somewhere safe if you can.",
        "Do not stay alone. Talk to the people around you.",
        "Take care of basic needs: water, food, and a blanket.",
        "Get information from officials. Stay with others until help arrives.",
      ],
    },
    warnings: { tr: [], en: [] },
    sources: ["ifrc"],
    hint: "Panic, fear, or emotional distress without a physical injury.",
    keywords: ["panik", "korkuyorum", "cok korktum", "korku", "agliyor", "kaygi", "panic", "scared", "afraid", "anxious"],
  },
];

export const CARD_IDS = CARDS.map((card) => card.id);

export function findCard(id: string): Card | undefined {
  return CARDS.find((card) => card.id === id);
}
