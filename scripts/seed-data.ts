/**
 * Seed content, derived from the client's own listing notes.
 * Districts, cities and land types are seed DATA, not constants — the admin can
 * create, rename and delete all of them. Nothing in the app may reference a
 * district by literal string.
 */

export const DISTRICTS = [
  { name: "Vavuniya", nameTa: "வவுனியா", code: "VAV", slug: "vavuniya", province: "Northern", order: 1,
    intro:
      "Vavuniya sits at the gateway to the Northern Province, where the A9 meets the road east to Trincomalee. Land here ranges from small residential blocks inside town to paddy and chena acreage along the Omanthai and Cheddikulam roads. Good access to the A9 and a clear deed are what move a block fastest.",
    introTa:
      "வவுனியா வடக்கு மாகாணத்தின் நுழைவாயிலில் அமைந்துள்ளது, இங்கு A9 பாதை திருகோணமலைக்கான கிழக்குப் பாதையுடன் சந்திக்கிறது. இங்குள்ள நிலங்கள் நகருக்குள் உள்ள சிறிய குடியிருப்புத் துண்டுகள் முதல் ஓமந்தை மற்றும் செட்டிகுளம் வீதிகளில் உள்ள வயல் மற்றும் சேனைக் காணி வரை பலவகைப்படும். A9 க்கு நல்ல அணுகலும் தெளிவான உரிமைப் பத்திரமும் ஒரு நிலத்துண்டை விரைவாக விற்கச் செய்யும் முக்கிய காரணிகள்." },
  { name: "Mannar", nameTa: "மன்னார்", code: "MAN", slug: "mannar", province: "Northern", order: 2,
    intro:
      "Mannar district covers the island causeway, the palmyra belt and the coastal stretch toward Musali. Buyers here look for coconut and palmyra land, tank-fed paddy, and increasingly coastal plots with road frontage.",
    introTa:
      "மன்னார் மாவட்டம் தீவுப் பாலம், பனை வளர்ச்சிப் பகுதி மற்றும் முசலி நோக்கிய கரையோரப் பகுதியை உள்ளடக்கியது. இங்குள்ள வாங்குபவர்கள் தென்னை மற்றும் பனை காணி, குளத்தால் நீர்ப்பாசனம் பெறும் வயல்கள், மேலும் அதிகரித்து வரும் அளவில் வீதி முகப்புடைய கரையோர மனைகளைத் தேடுகின்றனர்." },
  { name: "Jaffna", nameTa: "யாழ்ப்பாணம்", code: "JAF", slug: "jaffna", province: "Northern", order: 3,
    intro:
      "Jaffna is the most tightly held land market in the North. Blocks are smaller and priced per perch well above the mainland, with residential plots in Nallur, Chundikuli and Kokuvil in steady demand from returning families.",
    introTa:
      "யாழ்ப்பாணம் வடக்கில் மிகவும் இறுக்கமாக வைத்திருக்கப்படும் நில சந்தை ஆகும். இங்கு மனைகள் சிறியவையாகவும், பரப்பு ஒன்றுக்கான விலை பிரதான நிலத்தை விட அதிகமாகவும் இருக்கும்; நல்லூர், சுண்டுக்குளி மற்றும் கொக்குவில் ஆகிய இடங்களில் உள்ள குடியிருப்புத் துண்டுகளுக்கு திரும்பி வரும் குடும்பங்களிடமிருந்து நிலையான தேவை உள்ளது." },
  { name: "Mullaitivu", nameTa: "முல்லைத்தீவு", code: "MUL", slug: "mullaitivu", province: "Northern", order: 4,
    intro:
      "Mullaitivu offers the largest parcels in the North at the lowest price per perch — agricultural land, coconut, and coastal blocks near Nayaru and Mullaitivu town. Access road width is the single biggest value factor here.",
    introTa:
      "முல்லைத்தீவு வடக்கில் மிகக் குறைந்த பரப்பு விலையில் மிகப் பெரிய நிலத்துண்டுகளை வழங்குகிறது — விவசாய காணி, தென்னை, மற்றும் நாயாறு மற்றும் முல்லைத்தீவு நகரை அடுத்த கரையோர மனைகள். இங்கு வீதி அணுகலின் அகலமே மதிப்பை தீர்மானிக்கும் மிக முக்கிய காரணியாகும்." },
  { name: "Trincomalee", nameTa: "திருகோணமலை", code: "TRI", slug: "trincomalee", province: "Eastern", order: 5,
    intro:
      "Trincomalee combines a deep-water harbour town with paddy country inland toward Kantale. Coastal and near-town land carries a tourism premium; inland agricultural blocks remain among the best value in the East.",
    introTa:
      "திருகோணமலை ஆழ்கடல் துறைமுக நகரத்தையும் கந்தளாய் நோக்கிய உள்நாட்டு வயல் பிரதேசத்தையும் இணைக்கிறது. கரையோர மற்றும் நகருக்கு அருகிலுள்ள நிலங்களுக்கு சுற்றுலாத்துறை முக்கியத்துவம் காரணமாக கூடுதல் விலை உள்ளது; உள்நாட்டு விவசாய மனைகள் கிழக்கில் சிறந்த மதிப்புள்ள தெரிவுகளில் ஒன்றாக உள்ளன." },
  { name: "Batticaloa", nameTa: "மட்டக்களப்பு", code: "BAT", slug: "batticaloa", province: "Eastern", order: 6,
    intro:
      "Batticaloa is lagoon country — paddy land, coconut gardens and residential blocks around the town, Kattankudy and Eravur. Water source and flood level are the questions every serious buyer asks first.",
    introTa:
      "மட்டக்களப்பு ஒரு கடலோரத் தடாகப் பிரதேசம் — வயல் காணி, தென்னந்தோட்டங்கள் மற்றும் நகரம், கட்டாங்குடி மற்றும் ஏறாவூர் சுற்றியுள்ள குடியிருப்புத் துண்டுகள். நீர் ஆதாரமும் வெள்ள மட்டமும் ஒவ்வொரு தீவிர வாங்குபவரும் முதலில் கேட்கும் கேள்விகளாகும்." },
];

export const CITIES: { district: string; names: string[]; namesTa: string[] }[] = [
  {
    district: "vavuniya",
    names: ["Vavuniya Town", "Omanthai", "Cheddikulam", "Nedunkeni", "Panichankulam", "Puliyankulam", "Thandikulam"],
    namesTa: ["வவுனியா நகரம்", "ஓமந்தை", "செட்டிகுளம்", "நெடுங்கேணி", "பனிச்சங்குளம்", "புளியங்குளம்", "தாண்டிக்குளம்"],
  },
  {
    district: "mannar",
    names: ["Mannar Town", "Nanattan", "Murunkan", "Adampan", "Pesalai", "Musali"],
    namesTa: ["மன்னார் நகரம்", "நானாட்டான்", "முருங்கன்", "அடம்பன்", "பேசாலை", "முசலி"],
  },
  {
    district: "jaffna",
    names: ["Jaffna Town", "Nallur", "Chavakachcheri", "Point Pedro", "Kokuvil", "Chunnakam", "Manipay"],
    namesTa: ["யாழ்ப்பாணம் நகரம்", "நல்லூர்", "சாவகச்சேரி", "பருத்தித்துறை", "கொக்குவில்", "சுன்னாகம்", "மணிப்பாய்"],
  },
  {
    district: "mullaitivu",
    names: ["Mullaitivu Town", "Oddusuddan", "Puthukkudiyiruppu", "Nayaru", "Mankulam"],
    namesTa: ["முல்லைத்தீவு நகரம்", "ஒட்டிசுட்டான்", "புதுக்குடியிருப்பு", "நாயாறு", "மான்குளம்"],
  },
  {
    district: "trincomalee",
    names: ["Trincomalee Town", "Kantale", "Kinniya", "Mutur", "Nilaveli", "Uppuveli"],
    namesTa: ["திருகோணமலை நகரம்", "கந்தளாய்", "கிண்ணியா", "முத்தூர்", "நிலாவெளி", "உப்புவெளி"],
  },
  {
    district: "batticaloa",
    names: ["Batticaloa Town", "Kattankudy", "Eravur", "Valaichchenai", "Kaluwanchikudy", "Arayampathy"],
    namesTa: ["மட்டக்களப்பு நகரம்", "கட்டாங்குடி", "ஏறாவூர்", "வாழைச்சேனை", "காலுவாஞ்சிக்குடி", "அரையம்பதி"],
  },
];

export const LAND_TYPES = [
  { name: "Bare land", nameTa: "வெற்று காணி", slug: "bare-land", order: 1, hasBuilding: false,
    description: "Cleared or lightly wooded blocks with no structure, sold by the perch." },
  { name: "Agricultural land", nameTa: "விவசாய காணி", slug: "agricultural-land", order: 2, hasBuilding: false,
    description: "Chena and cultivated acreage, usually sold by the acre." },
  { name: "Paddy land", nameTa: "நெல் வயல்", slug: "paddy-land", order: 3, hasBuilding: false,
    description: "Tank-fed or rain-fed paddy fields with established water access." },
  { name: "Coconut land", nameTa: "தென்னை காணி", slug: "coconut-land", order: 4, hasBuilding: false,
    description: "Established coconut gardens with a bearing crop." },
  { name: "Residential plot", nameTa: "குடியிருப்பு காணி", slug: "residential-plot", order: 5, hasBuilding: false,
    description: "Surveyed blocks inside or near town, ready to build on." },
  { name: "House & land", nameTa: "வீடு மற்றும் காணி", slug: "house-and-land", order: 6, hasBuilding: true,
    description: "A built house sold together with its block." },
  { name: "Commercial land", nameTa: "வணிக காணி", slug: "commercial-land", order: 7, hasBuilding: false,
    description: "Road-frontage land zoned or suited for business use." },
  { name: "Building", nameTa: "கட்டிடம்", slug: "building", order: 8, hasBuilding: true,
    description: "Standalone commercial or residential buildings." },
  { name: "Shop", nameTa: "கடை", slug: "shop", order: 9, hasBuilding: true,
    description: "Retail units in a town centre or along a main road." },
];

export type SeedLand = {
  title: string;
  district: string;
  city: string;
  landType: string;
  purpose: "sale" | "rent" | "both";
  sizeValue: number;
  sizeUnit: "perch" | "acre" | "rood" | "sqft";
  salePrice?: number;
  rentAmount?: number;
  depositAmount?: number;
  priceNegotiable?: boolean;
  area?: string;
  nearestTown?: string;
  distanceFromTownKm?: number;
  deedType?: "freehold" | "ldo_permit" | "grant" | "other";
  accessRoadWidthFt?: number;
  frontageFt?: number;
  waterSource?: "none" | "well" | "agri_well" | "tank" | "nwsdb";
  utilities?: { electricity?: boolean; waterLine?: boolean; well?: boolean; telecom?: boolean };
  bedrooms?: number;
  bathrooms?: number;
  buildingSizeSqft?: number;
  features?: string[];
  description: string;
  ownerName: string;
  contactNumbers: string[];
  whatsappNumber?: string;
  status?: "available" | "reserved" | "sold" | "rented";
  isFeatured?: boolean;
  isPopular?: boolean;
  popularRank?: number;
  /** Which generated scene to render for the cover photo. */
  scene: "paddy" | "bare" | "coconut" | "house" | "town" | "coastal";
};

export const SAMPLE_LANDS: SeedLand[] = [
  {
    title: "20 perches bare land at Omanthai, 4 km from Vavuniya town",
    district: "vavuniya", city: "Omanthai", landType: "bare-land", purpose: "sale",
    sizeValue: 20, sizeUnit: "perch", salePrice: 1_600_000, priceNegotiable: true,
    area: "Panichankulam", nearestTown: "Vavuniya", distanceFromTownKm: 4,
    deedType: "freehold", accessRoadWidthFt: 20, frontageFt: 55, waterSource: "well",
    utilities: { electricity: true, telecom: true, well: true },
    features: ["Corner block", "Fenced", "Near school"],
    description:
      "A clean, level 20-perch block on the Omanthai road, four kilometres from Vavuniya town. The land has a 20ft motorable access road, an existing well, and electricity already at the boundary. Fully fenced on three sides with a clear freehold deed, ready to build on immediately. A school and a small shop row are within walking distance, and the A9 is a five-minute drive.",
    ownerName: "S. Suntharalingam", contactNumbers: ["+94771234567"], whatsappNumber: "+94771234567",
    isFeatured: true, isPopular: true, popularRank: 1, scene: "bare",
  },
  {
    title: "2 acres tank-fed paddy land near Cheddikulam",
    district: "vavuniya", city: "Cheddikulam", landType: "paddy-land", purpose: "sale",
    sizeValue: 2, sizeUnit: "acre", salePrice: 3_200_000, priceNegotiable: true,
    nearestTown: "Vavuniya", distanceFromTownKm: 18,
    deedType: "freehold", accessRoadWidthFt: 12, waterSource: "tank",
    utilities: { electricity: false },
    features: ["Tank-fed", "Two cultivation seasons"],
    description:
      "Two acres of established paddy land drawing water from the village tank, worked for two seasons a year. Bund and channel are in good order. The block sits about 800 metres off the Cheddikulam road on a 12ft cart track that carries a tractor comfortably. Suits a buyer expanding an existing holding.",
    ownerName: "K. Ramanathan", contactNumbers: ["+94772345678"],
    isPopular: true, popularRank: 3, scene: "paddy",
  },
  {
    title: "House and 15 perches at Nallur, Jaffna",
    district: "jaffna", city: "Nallur", landType: "house-and-land", purpose: "sale",
    sizeValue: 15, sizeUnit: "perch", salePrice: 18_500_000,
    area: "Nallur", nearestTown: "Jaffna", distanceFromTownKm: 2,
    deedType: "freehold", accessRoadWidthFt: 18, frontageFt: 40, waterSource: "nwsdb",
    utilities: { electricity: true, waterLine: true, well: true, telecom: true },
    bedrooms: 3, bathrooms: 2, buildingSizeSqft: 1650,
    features: ["Walking distance to Nallur Kovil", "Parapet wall", "Motorable road"],
    description:
      "A well-maintained three-bedroom house on 15 perches in Nallur, two kilometres from Jaffna town centre. Tiled throughout, with an attached master bathroom, a separate kitchen and a covered verandah. NWSDB water line and a backup well. The property is fully walled with a steel gate, and Nallur Kovil is within walking distance.",
    ownerName: "M. Thavarajah", contactNumbers: ["+94773456789"], whatsappNumber: "+94773456789",
    isFeatured: true, isPopular: true, popularRank: 2, scene: "house",
  },
  {
    title: "Commercial building for rent on Main Street, Vavuniya",
    district: "vavuniya", city: "Vavuniya Town", landType: "building", purpose: "rent",
    sizeValue: 12, sizeUnit: "perch", rentAmount: 10_000, depositAmount: 100_000,
    nearestTown: "Vavuniya", distanceFromTownKm: 0,
    deedType: "freehold", accessRoadWidthFt: 30, frontageFt: 22,
    utilities: { electricity: true, waterLine: true, telecom: true },
    buildingSizeSqft: 900,
    features: ["Main road frontage", "Three-phase power", "Shutter front"],
    description:
      "Ground-floor commercial space on Main Street with a shutter front and 22 feet of road frontage. Three-phase power, a washroom at the rear and a small store room. Suits a retail shop, a communication centre or a small office. Rent is LKR 10,000 per month with a refundable deposit of LKR 100,000.",
    ownerName: "A. Jeyakumar", contactNumbers: ["+94774567890"], whatsappNumber: "+94774567890",
    isPopular: true, popularRank: 4, scene: "town",
  },
  {
    title: "1 acre coconut land at Murunkan, Mannar",
    district: "mannar", city: "Murunkan", landType: "coconut-land", purpose: "sale",
    sizeValue: 1, sizeUnit: "acre", salePrice: 2_400_000, priceNegotiable: true,
    nearestTown: "Mannar", distanceFromTownKm: 22,
    deedType: "freehold", accessRoadWidthFt: 15, waterSource: "agri_well",
    utilities: { electricity: true, well: true },
    features: ["48 bearing palms", "Agricultural well"],
    description:
      "One acre of established coconut land at Murunkan with 48 bearing palms and an agricultural well fitted with a pump. The block has 15ft road access and three-phase power available at the road. Currently leased for picking; possession can be given at short notice.",
    ownerName: "V. Anthonipillai", contactNumbers: ["+94775678901"],
    scene: "coconut",
  },
  {
    title: "10 perches residential plot at Kokuvil, Jaffna",
    district: "jaffna", city: "Kokuvil", landType: "residential-plot", purpose: "sale",
    sizeValue: 10, sizeUnit: "perch", salePrice: 4_500_000,
    nearestTown: "Jaffna", distanceFromTownKm: 5,
    deedType: "freehold", accessRoadWidthFt: 20, frontageFt: 35, waterSource: "well",
    utilities: { electricity: true, waterLine: true, telecom: true, well: true },
    features: ["Surveyed and blocked out", "Near railway station"],
    description:
      "A surveyed 10-perch plot in a quiet residential lane at Kokuvil, five kilometres from Jaffna town. All utilities are at the boundary, including an NWSDB line, and the block is one of six in a small development with a shared 20ft road. Kokuvil railway station is a short walk away.",
    ownerName: "R. Sivagnanam", contactNumbers: ["+94776789012"], whatsappNumber: "+94776789012",
    isPopular: true, popularRank: 5, scene: "bare",
  },
  {
    title: "5 acres agricultural land at Oddusuddan, Mullaitivu",
    district: "mullaitivu", city: "Oddusuddan", landType: "agricultural-land", purpose: "sale",
    sizeValue: 5, sizeUnit: "acre", salePrice: 4_000_000, priceNegotiable: true,
    nearestTown: "Mankulam", distanceFromTownKm: 12,
    deedType: "ldo_permit", accessRoadWidthFt: 12, waterSource: "agri_well",
    utilities: { well: true },
    features: ["Cleared", "Suitable for maize and chilli"],
    description:
      "Five acres of cleared chena land at Oddusuddan, held on an LDO permit. Previously cultivated with maize and chilli. An agricultural well on the block gives year-round water, and a 12ft track brings a tractor to the boundary. Priced to sell as one parcel.",
    ownerName: "P. Kanagaratnam", contactNumbers: ["+94777890123"],
    scene: "paddy",
  },
  {
    title: "Coastal land 30 perches at Nilaveli, Trincomalee",
    district: "trincomalee", city: "Nilaveli", landType: "bare-land", purpose: "sale",
    sizeValue: 30, sizeUnit: "perch", salePrice: 12_000_000,
    nearestTown: "Trincomalee", distanceFromTownKm: 16,
    deedType: "freehold", accessRoadWidthFt: 20, frontageFt: 60,
    utilities: { electricity: true, telecom: true },
    features: ["400m from the beach", "Tourism zone", "Corner block"],
    description:
      "Thirty perches of level land at Nilaveli, four hundred metres from the beach and inside the tourism corridor. Twenty-foot road access on two sides, electricity at the boundary. Suitable for a guest house or a holiday home, with a clear freehold deed and a completed survey plan.",
    ownerName: "S. Nagendran", contactNumbers: ["+94778901234"], whatsappNumber: "+94778901234",
    isFeatured: true, scene: "coastal",
  },
  {
    title: "Paddy land 3 acres at Kaluwanchikudy, Batticaloa",
    district: "batticaloa", city: "Kaluwanchikudy", landType: "paddy-land", purpose: "sale",
    sizeValue: 3, sizeUnit: "acre", salePrice: 4_200_000,
    nearestTown: "Batticaloa", distanceFromTownKm: 24,
    deedType: "freehold", accessRoadWidthFt: 10, waterSource: "tank",
    features: ["Irrigation channel on boundary", "Two seasons"],
    description:
      "Three acres of paddy land at Kaluwanchikudy with an irrigation channel running along the northern boundary. Cultivated both Maha and Yala. The bund is in good repair and the block has never flooded above the crop line in the last decade.",
    ownerName: "T. Sithamparanathan", contactNumbers: ["+94779012345"],
    scene: "paddy",
  },
  {
    title: "Shop for rent at Kattankudy junction",
    district: "batticaloa", city: "Kattankudy", landType: "shop", purpose: "rent",
    sizeValue: 400, sizeUnit: "sqft", rentAmount: 25_000, depositAmount: 150_000,
    nearestTown: "Batticaloa", distanceFromTownKm: 6,
    accessRoadWidthFt: 40, frontageFt: 16,
    utilities: { electricity: true, waterLine: true, telecom: true },
    buildingSizeSqft: 400,
    features: ["Junction location", "High footfall", "Air-conditioned"],
    description:
      "A 400 sq ft air-conditioned retail unit right on the Kattankudy junction, with sixteen feet of glass frontage onto the main road. Very high footfall through the day. Rent LKR 25,000 per month, deposit LKR 150,000, minimum one-year agreement.",
    ownerName: "M. Rizwan", contactNumbers: ["+94770123456"], whatsappNumber: "+94770123456",
    scene: "town",
  },
  {
    title: "40 perches with old house at Chavakachcheri — sale or rent",
    district: "jaffna", city: "Chavakachcheri", landType: "house-and-land", purpose: "both",
    sizeValue: 40, sizeUnit: "perch", salePrice: 9_800_000,
    rentAmount: 35_000, depositAmount: 200_000,
    nearestTown: "Chavakachcheri", distanceFromTownKm: 1,
    deedType: "freehold", accessRoadWidthFt: 18, frontageFt: 70, waterSource: "well",
    utilities: { electricity: true, well: true, telecom: true },
    bedrooms: 2, bathrooms: 1, buildingSizeSqft: 1100,
    features: ["Large garden", "Mature mango trees", "Well on site"],
    description:
      "Forty perches with an older two-bedroom house at Chavakachcheri, one kilometre from the town centre. The house is liveable and structurally sound but would benefit from renovation. A large garden with mature mango and jak trees, and a good well. Available either for outright sale or on a monthly rental.",
    ownerName: "N. Puvanendran", contactNumbers: ["+94771112223"], whatsappNumber: "+94771112223",
    isPopular: true, popularRank: 6, scene: "house",
  },
  {
    title: "Commercial land 25 perches on the A9 at Thandikulam",
    district: "vavuniya", city: "Thandikulam", landType: "commercial-land", purpose: "sale",
    sizeValue: 25, sizeUnit: "perch", salePrice: 8_750_000, priceNegotiable: true,
    nearestTown: "Vavuniya", distanceFromTownKm: 6,
    deedType: "freehold", accessRoadWidthFt: 60, frontageFt: 80,
    utilities: { electricity: true, waterLine: true, telecom: true },
    features: ["A9 frontage", "80ft frontage", "Filling station potential"],
    description:
      "Twenty-five perches directly on the A9 at Thandikulam with eighty feet of highway frontage — the kind of frontage that rarely comes to market. Level, cleared and fully serviced. Suits a filling station, a showroom or a warehouse, with all approvals to be obtained by the buyer.",
    ownerName: "S. Suntharalingam", contactNumbers: ["+94771234567"], whatsappNumber: "+94771234567",
    isFeatured: true, scene: "bare",
  },
  {
    title: "Half acre near Pesalai beach, Mannar",
    district: "mannar", city: "Pesalai", landType: "bare-land", purpose: "sale",
    sizeValue: 2, sizeUnit: "rood", salePrice: 3_600_000,
    nearestTown: "Mannar", distanceFromTownKm: 14,
    deedType: "grant", accessRoadWidthFt: 15,
    utilities: { electricity: true },
    features: ["600m from the sea", "Palmyra boundary"],
    description:
      "Two roods, or half an acre, at Pesalai — six hundred metres from the sea and bordered by a mature palmyra line. Held on a Swarnabhoomi grant. Sandy but stable soil, suitable for a house or a small coconut planting. Fifteen-foot road access from the Pesalai main road.",
    ownerName: "J. Croos", contactNumbers: ["+94772223334"],
    scene: "coastal",
  },
  {
    title: "18 perches residential block at Kantale, Trincomalee",
    district: "trincomalee", city: "Kantale", landType: "residential-plot", purpose: "sale",
    sizeValue: 18, sizeUnit: "perch", salePrice: 2_700_000, priceNegotiable: true,
    nearestTown: "Kantale", distanceFromTownKm: 2,
    deedType: "freehold", accessRoadWidthFt: 20, frontageFt: 45, waterSource: "nwsdb",
    utilities: { electricity: true, waterLine: true, telecom: true },
    features: ["Near Kantale tank", "Quiet lane"],
    description:
      "An eighteen-perch block in a quiet residential lane two kilometres from Kantale town, close to the tank. Water line and electricity at the boundary, twenty-foot road, clear deed. A straightforward block for a family building their first house.",
    ownerName: "W. Bandara", contactNumbers: ["+94773334445"],
    status: "reserved", scene: "bare",
  },
  {
    title: "12 perches at Uppuveli — sold",
    district: "trincomalee", city: "Uppuveli", landType: "residential-plot", purpose: "sale",
    sizeValue: 12, sizeUnit: "perch", salePrice: 5_400_000,
    nearestTown: "Trincomalee", distanceFromTownKm: 5,
    deedType: "freehold", accessRoadWidthFt: 18, frontageFt: 36,
    utilities: { electricity: true, waterLine: true },
    features: ["Near the beach road"],
    description:
      "Twelve perches off the Uppuveli beach road, sold in three weeks through kani.lk to a buyer from Colombo. Level, serviced and walking distance from the beach.",
    ownerName: "K. Sivakumar", contactNumbers: ["+94774445556"],
    status: "sold", scene: "coastal",
  },
  {
    title: "House for rent at Eravur, Batticaloa",
    district: "batticaloa", city: "Eravur", landType: "house-and-land", purpose: "rent",
    sizeValue: 20, sizeUnit: "perch", rentAmount: 30_000, depositAmount: 120_000,
    nearestTown: "Batticaloa", distanceFromTownKm: 12,
    deedType: "freehold", accessRoadWidthFt: 18, waterSource: "well",
    utilities: { electricity: true, waterLine: true, well: true, telecom: true },
    bedrooms: 3, bathrooms: 2, buildingSizeSqft: 1400,
    features: ["Furnished", "Parking for two vehicles"],
    description:
      "A furnished three-bedroom house at Eravur on a twenty-perch block, available on a monthly rental. Two bathrooms, a fitted kitchen, ceiling fans throughout and parking for two vehicles inside the gate. Rent LKR 30,000 per month with a deposit of LKR 120,000.",
    ownerName: "A. Farook", contactNumbers: ["+94775556667"], whatsappNumber: "+94775556667",
    status: "rented", scene: "house",
  },
];
