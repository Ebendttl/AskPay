/**
 * translations.ts
 *
 * Lightweight JSON translation dictionary for AskPay.
 * Contains strings for English (en) and Swahili (sw) for all pages and components.
 */

export interface TranslationDictionary {
  [locale: string]: {
    [key: string]: string;
  };
}

export const translations: TranslationDictionary = {
  en: {
    // Navigation / General
    app_title: "AskPay",
    nav_home: "Home",
    nav_how_it_works: "How It Works",
    nav_about: "About",
    nav_docs: "Docs",
    nav_pricing: "Pricing",
    nav_history: "History",
    nav_credits: "Credits",
    nav_roadmap: "Roadmap",
    nav_legal: "Legal",
    nav_contact: "Contact",
    nav_changelog: "Changelog",
    all_rights_reserved: "All rights reserved.",
    back_to_chat: "← Back to AskPay",

    // Hero Section
    hero_badge: "Pay-per-use AI Chat",
    hero_title_1: "Instant AI Answers,",
    hero_title_2: "Pay Per Query",
    hero_description: "No monthly subscriptions. No registration. Pay a tiny fraction of a cent per question using Celo USDm stablecoin, directly from your wallet.",
    hero_features_title: "How it differs from typical AI assistants:",
    hero_feat_no_sub_title: "Zero Subscriptions",
    hero_feat_no_sub_desc: "Pay exactly 0.01 USDm per question. If you don't ask, you don't pay.",
    hero_feat_privacy_title: "Wallet-Only Access",
    hero_feat_privacy_desc: "No email, passwords, or credit cards required. Your wallet is your account.",
    hero_feat_speed_title: "Settled on Celo",
    hero_feat_speed_desc: "Sub-cent gas fees and 5-second transaction finality for a seamless experience.",
    hero_cta_connect: "Connect Wallet to Start",
    hero_step_1_title: "Ask",
    hero_step_1_detail: "Type any question into the chat. No account or subscription needed.",
    hero_step_2_title: "Pay a few cents",
    hero_step_2_detail: "Approve a small USDm stablecoin fee — fractions of a cent per query.",
    hero_step_3_title: "Get your answer",
    hero_step_3_detail: "Once the payment is confirmed on-chain, your AI answer arrives instantly.",
    hero_step_label: "Step",
    hero_trust_1: "Non-custodial — your keys, your funds",
    hero_trust_2: "Open-source smart contract",
    hero_trust_3: "Payments settle in ~5 seconds on Celo",
    hero_trust_4: "No subscription, pay per query",


    // Empty State
    empty_state_title: "Ask a question — pay {fee} USDm per query",
    empty_state_desc: "Your question is paid for on-chain before the AI answers it. Transaction logs and replies are stored locally in your browser.",

    // Chat Box
    chat_connected_as: "Connected",
    chat_viewing_history: "Viewing history item ({status})",
    chat_ask_new: "Ask new question",
    chat_ask_another: "Ask another question",
    chat_balance: "USDm Balance",
    chat_insufficient_funds: "Insufficient USDm balance. You need at least {fee} USDm to ask a question.",
    chat_insufficient_funds_testnet: "Testnet: use the mint script to top up your balance.",
    chat_placeholder_new: "Type to ask a new question…",
    chat_placeholder: "Type your question…",
    chat_button_processing: "Processing…",
    chat_button_ask: "Ask ({fee} USDm)",
    chat_clear_history_confirm: "Are you sure you want to clear your query history?",
    chat_clear_history_title: "Clear all history",
    chat_no_history: "No questions asked yet.",
    chat_receipt: "Receipt",
    chat_payment_failed: "⚠️ Payment failed or rejected.",
    chat_payment_confirmed_verifying: "⌛ Payment confirmed. Verifying on-chain & waiting for AI response...",
    chat_error_verifying: "⚠️ Error verifying query: {msg}",
    chat_retry: "↺ Retry",

    // Status Badges
    status_checking_allowance: "Checking allowance…",
    status_approving: "Sending approve tx…",
    status_approve_confirming: "Confirming approve…",
    status_asking: "Sending payment tx…",
    status_ask_confirming: "Confirming payment…",
    status_success: "Payment confirmed ✓",
    status_error: "Transaction failed",

    // Pricing Page
    pricing_title: "Pay Only For What You Use",
    pricing_subtitle: "No subscriptions, no hidden setup fees, and no recurring bills. You pay a small, fixed fee per question directly on-chain.",
    pricing_cost_title: "Per-Query Cost",
    pricing_cost_desc: "Every question you ask costs exactly 0.01 USDm (pegged to 1 US Cent) sent to our pay-gate contract. Celo network gas fees are extra but typically average less than $0.001 per transaction.",
    pricing_adjustment_title: "Fee Adjustment Policy",
    pricing_adjustment_desc: "The query fee is configurable in the deployed smart contract. The owner may adjust this value up or down to align with downstream AI LLM API provider costs. The interface will always display the current live fee fetched directly from the blockchain before you confirm any payment.",
    pricing_compare_title: "How it compares",
    pricing_faq_title: "Have questions about transaction safety?",
    pricing_faq_desc: "Read our full 'How It Works' page to understand how smart contract payments are verified and how browser-local caching secures your queries.",
    pricing_faq_cta: "Read the FAQ",

    // Pricing Table
    table_header_feature: "Feature",
    table_header_askpay: "AskPay Model",
    table_header_subscription: "Typical Subscription",
    table_basis: "Pricing Basis",
    table_basis_askpay: "Pay-per-query (0.01 USDm / query)",
    table_basis_sub: "Flat monthly rate (typically ~$20/mo)",
    table_commitment: "Upfront Commitment",
    table_commitment_askpay: "None — pay only when you ask",
    table_commitment_sub: "100% paid upfront regardless of usage",
    table_kyc: "Account / KYC",
    table_kyc_askpay: "None — connect wallet & query",
    table_kyc_sub: "Required email, password, profile setup",
    table_method: "Payment Method",
    table_method_askpay: "Celo USDm stablecoin",
    table_method_sub: "Credit/Debit Card (recurring mandate)",
    table_cancel: "Cancellation Hassle",
    table_cancel_askpay: "None — simply close the app",
    table_cancel_sub: "Multi-step unsubscribe flows required",

    // About Page
    about_title: "About AskPay",
    about_subtitle: "A pay-per-use AI chat app that settles payments on the Celo blockchain — no subscription, no account, no monthly bill.",
    about_problem_title: "The problem it solves",
    about_problem_desc_1: "Most AI assistants today require a subscription — you pay $20 a month whether you ask one question or a thousand. For people who want occasional, high-quality AI answers, that model is wasteful and excludes anyone who can't or won't commit to a recurring charge.",
    about_problem_desc_2: "AskPay's answer is simple: pay per query in USDm stablecoin, directly from your wallet. No registration, no credit card, no account to manage. The cost of a single query is small enough to be trivial — and you only pay when you actually use it.",
    about_problem_desc_3: "The primary audience is anyone in a region where MiniPay is already the everyday payment tool. For those users, AskPay is a natural extension: the same wallet they use to send money to family can now answer their questions.",
    about_pos_title: "Built for Celo's Proof of Ship",
    about_pos_desc_1: "AskPay was built as part of Celo's Proof of Ship program — a builder initiative that challenges developers to ship real, usable products on Celo rather than just prototype demos.",
    about_pos_desc_2: "The program pushes builders to go through the full product lifecycle: designing a contract, deploying it to mainnet, integrating a real frontend, and making it accessible to actual users — not just running on localhost. AskPay is the direct result of working through that process.",
    about_why_title: "Why we built this",
    about_why_desc_1: "Honestly, the starting point was curiosity: what does it actually take to gate an AI API response behind a verifiable on-chain payment? Not a simulated payment, not a trusted client claim — a real blockchain transaction the server can verify before it calls the LLM.",
    about_why_desc_2: "Getting that plumbing solid without leaking query IDs or racing the block confirmation was the interesting engineering challenge. The use-minipay-paygate package came out of solving that cleanly.",
    about_builder_title: "Who built it",
    about_builder_bio: "Full-stack / Web3 developer building on Celo. AskPay is a Proof of Ship submission exploring pay-per-use AI tooling.",
    about_links_title: "Links",
    about_built_with_title: "Built with",
    about_built_with_sub: "Everything listed here is actually used in the codebase — no aspirational claims.",
    about_cta_try: "Try AskPay",

    // How It Works Page
    how_title: "How It Works",
    how_subtitle: "Under the hood of AskPay's decentralized payment gate.",
    how_step_1: "1. Prompt and Payment",
    how_step_1_desc: "You type your question and authorize the transaction in your Celo wallet. This deposits exactly 0.01 USDm into the smart contract and broadcasts a unique QueryPaid event on-chain.",
    how_step_2: "2. Backend Verification",
    how_step_2_desc: "Our server intercepts the transaction hash, verifies it on the Celo network via use-minipay-paygate, ensures the receiver and query ID are valid, and only then fetches the response.",
    how_step_3: "3. LLM Streaming",
    how_step_3_desc: "The server queries the AI model (Gemini/Groq) and streams the response word-by-word back to your browser. Your transaction hash is your receipt.",

    // Roadmap Page
    roadmap_title: "AskPay Roadmap",
    roadmap_subtitle: "Our planned phases for expanding the pay-per-query ecosystem.",
    roadmap_phase_1: "Phase 1: Foundation",
    roadmap_phase_1_desc: "Design the smart contracts, configure Celo testnet deployments, and construct the local testing environment.",
    roadmap_phase_2: "Phase 2: Payment Gate",
    roadmap_phase_2_desc: "Implement the on-chain payment verification middleware and complete mainnet validation of USDm transactions.",
    roadmap_phase_3: "Phase 3: AI Ecosystem",
    roadmap_phase_3_desc: "Add streaming responses, fallback LLM logic, sliding-window rate limiting, and basic internationalization for MiniPay markets.",

    // Changelog Page
    changelog_title: "Changelog",
    changelog_subtitle: "Latest updates and enhancements shipped to AskPay.",
    changelog_v1_0: "v1.0.0 — Streaming & Rate Limiting",
    changelog_v1_0_desc: "Completed Phase 3 upgrades. Added word-by-word streaming, retry fallback on LLM timeout, per-IP rate limiting, and Kiswahili localizations.",

    // Credits Page
    credits_title: "Credits & Acknowledgements",
    credits_subtitle: "Thank you to the libraries, networks, and creators that made AskPay possible.",

    // Contact Page
    contact_title: "Contact Developer",
    contact_subtitle: "Have feedback or questions? Send a direct message.",
    contact_name: "Name",
    contact_email: "Email",
    contact_message: "Message",
    contact_submit: "Send Message",
    contact_sending: "Sending…",
    contact_success: "Message sent successfully!",

    // Legal Page
    legal_title: "Legal & Privacy Terms",
    legal_subtitle: "How AskPay manages transactions, cookies, and local data.",
    legal_terms_1: "1. No Accounts or Subscriptions",
    legal_terms_1_desc: "AskPay does not store passwords, credit cards, or KYC data. You only interact via Celo transactions.",
    legal_terms_2: "2. Cookie Policy",
    legal_terms_2_desc: "We use browser local storage solely to cache your chat history locally. No tracking or marketing cookies are used."
  },
  sw: {
    // Navigation / General
    app_title: "AskPay",
    nav_home: "Mwanzo",
    nav_how_it_works: "Jinsi Inavyofanya Kazi",
    nav_about: "Kuhusu",
    nav_docs: "Nyaraka",
    nav_pricing: "Bei",
    nav_history: "Historia",
    nav_credits: "Shukrani",
    nav_roadmap: "Ramani ya Njia",
    nav_legal: "Kisheria",
    nav_contact: "Mawasiliano",
    nav_changelog: "Mabadiliko",
    all_rights_reserved: "Haki zote zimehifadhiwa.",
    back_to_chat: "← Rudi kwenye AskPay",

    // Hero Section
    hero_badge: "Mazungumzo ya AI ya Lipa Unavyotumia",
    hero_title_1: "Majibu ya AI ya Haraka,",
    hero_title_2: "Lipa kwa Kila Swali",
    hero_description: "Hakuna usajili wa kila mwezi. Hakuna kujisajili. Lipa sehemu ndogo sana ya senti kwa kila swali ukitumia sarafu ya USDm kwenye mtandao wa Celo, moja kwa moja kutoka kwenye pochi yako.",
    hero_features_title: "Jinsi inavyotofautiana na wasaidizi wa kawaida wa AI:",
    hero_feat_no_sub_title: "Sifuri ya Usajili",
    hero_feat_no_sub_desc: "Lipa hasa 0.01 USDm kwa kila swali. Usipouliza, haulipi.",
    hero_feat_privacy_title: "Ufikiaji wa Pochi Tu",
    hero_feat_privacy_desc: "Hakuna barua pepe, nywila, au kadi za mkopo zinazohitajika. Pochi yako ndio akaunti yako.",
    hero_feat_speed_title: "Imewekwa kwenye Celo",
    hero_feat_speed_desc: "Ada ya gesi ya chini ya senti moja na sekunde 5 kukamilisha muamala kwa matumizi rahisi.",
    hero_cta_connect: "Unganisha Pochi ili Kuanza",
    hero_step_1_title: "Uliza",
    hero_step_1_detail: "Andika swali lolote kwenye soga. Hakuna akaunti au usajili unaohitajika.",
    hero_step_2_title: "Lipa senti chache",
    hero_step_2_detail: "Idhinisha ada ndogo ya sarafu ya USDm — sehemu ya senti kwa kila swali.",
    hero_step_3_title: "Pata jibu lako",
    hero_step_3_detail: "Malipo yakithibitishwa kwenye blockchain, jibu lako la AI litafika papo hapo.",
    hero_step_label: "Hatua ya",
    hero_trust_1: "Sio ya kizuizini — funguo zako, pesa zako",
    hero_trust_2: "Mkataba wa smart wa vyanzo wazi",
    hero_trust_3: "Miamala hukamilika kwa sekunde ~5 kwenye Celo",
    hero_trust_4: "Hakuna usajili wa kila mwezi, lipa kwa swali",


    // Empty State
    empty_state_title: "Uliza swali — lipa {fee} USDm kwa kila swali",
    empty_state_desc: "Swali lako linalipiwa kwenye blockchain kabla ya AI kujibu. Kumbukumbu za miamala na majibu huhifadhiwa kwenye kivinjari chako cha ndani.",

    // Chat Box
    chat_connected_as: "Imeunganishwa",
    chat_viewing_history: "Kuangalia historia ({status})",
    chat_ask_new: "Uliza swali jipya",
    chat_ask_another: "Uliza swali lingine",
    chat_balance: "Salio la USDm",
    chat_insufficient_funds: "Salio la USDm halitoshi. Unahitaji angalau {fee} USDm ili kuuliza swali.",
    chat_insufficient_funds_testnet: "Testnet: tumia programu ya mint kuongeza salio lako.",
    chat_placeholder_new: "Andika ili kuuliza swali jipya…",
    chat_placeholder: "Andika swali lako…",
    chat_button_processing: "Inachakata…",
    chat_button_ask: "Uliza ({fee} USDm)",
    chat_clear_history_confirm: "Je, una uhakika unataka kufuta historia ya maswali yako?",
    chat_clear_history_title: "Futa historia yote",
    chat_no_history: "Hakuna maswali yaliyoulizwa bado.",
    chat_receipt: "Stakabadhi",
    chat_payment_failed: "⚠️ Malipo yameshindwa au yamekataliwa.",
    chat_payment_confirmed_verifying: "⌛ Malipo yamethibitishwa. Inathibitisha na kusubiri majibu ya AI...",
    chat_error_verifying: "⚠️ Hitilafu ya kuthibitisha swali: {msg}",
    chat_retry: "↺ Jaribu Tena",

    // Status Badges
    status_checking_allowance: "Inakagua ruhusa…",
    status_approving: "Inatuma muamala wa ruhusa…",
    status_approve_confirming: "Inathibitisha ruhusa…",
    status_asking: "Inatuma muamala wa malipo…",
    status_ask_confirming: "Inathibitisha malipo…",
    status_success: "Malipo yamethibitishwa ✓",
    status_error: "Muamala umeshindwa",

    // Pricing Page
    pricing_title: "Lipa kwa Kile Unachotumia Tu",
    pricing_subtitle: "Hakuna usajili wa kila mwezi, ada za siri, wala bili zinazojirudia. Unalipa ada ndogo ya kudumu kwa kila swali moja kwa moja kwenye blockchain.",
    pricing_cost_title: "Gharama kwa Kila Swali",
    pricing_cost_desc: "Kila swali unalouliza linagharimu hasa 0.01 USDm (sawa na Senti 1 ya Marekani) iliyotumwa kwenye mkataba wetu wa malipo. Ada za gesi za mtandao wa Celo ni za ziada lakini kwa wastani ni chini ya $0.001 kwa kila muamala.",
    pricing_adjustment_title: "Sera ya Marekebisho ya Ada",
    pricing_adjustment_desc: "Ada ya swali inaweza kubadilishwa kwenye mkataba wa smart uliotumwa. Mmiliki anaweza kurekebisha thamani hii juu au chini ili kuendana na gharama za watoa huduma wa AI LLM. Skrini itaonyesha ada ya sasa kutoka kwenye blockchain kabla ya kuthibitisha malipo yoyote.",
    pricing_compare_title: "Jinsi inavyolinganishwa",
    pricing_faq_title: "Una maswali kuhusu usalama wa miamala?",
    pricing_faq_desc: "Soma ukurasa wetu kamili wa 'Jinsi Inavyofanya Kazi' ili kuelewa jinsi malipo ya mkataba wa smart yanavyothibitishwa na jinsi historia inavyolindwa kwenye kivinjari chako.",
    pricing_faq_cta: "Soma FAQ",

    // Pricing Table
    table_header_feature: "Kipengele",
    table_header_askpay: "Mfumo wa AskPay",
    table_header_subscription: "Usajili wa Kawaida",
    table_basis: "Msingi wa Bei",
    table_basis_askpay: "Lipa kwa kila swali (0.01 USDm / swali)",
    table_basis_sub: "Kiwango cha kila mwezi (kawaida ~$20/mwezi)",
    table_commitment: "Ahadi ya Mapema",
    table_commitment_askpay: "Hakuna — lipa tu unapouliza",
    table_commitment_sub: "100% inalipwa mapema bila kujali matumizi",
    table_kyc: "Akaunti / KYC",
    table_kyc_askpay: "Hakuna — unganisha pochi & uliza",
    table_kyc_sub: "Inahitaji barua pepe, nywila, na maelezo ya wasifu",
    table_method: "Njia ya Malipo",
    table_method_askpay: "Sarafu ya Celo USDm",
    table_method_sub: "Kadi ya Mkopo (agizo linalojirudia)",
    table_cancel: "Usumbufu wa Kughairi",
    table_cancel_askpay: "Hakuna — funga tu programu",
    table_cancel_sub: "Inahitaji hatua nyingi ili kujiondoa",

    // About Page
    about_title: "Kuhusu AskPay",
    about_subtitle: "Programu ya mazungumzo ya AI ya kulipia unavyotumia inayolipia kwenye blockchain ya Celo — hakuna usajili, hakuna akaunti, hakuna bili ya kila mwezi.",
    about_problem_title: "Tatizo linalotatuliwa",
    about_problem_desc_1: "Wasaidizi wengi wa AI leo wanahitaji usajili — unalipa $20 kwa mwezi iwe unauliza swali moja au elfu moja. Kwa watu wanaotaka majibu ya AI mara chache, mfumo huo unawapotezea pesa na kuwatenga wale ambao hawawezi au hawataki kujisajili kila mwezi.",
    about_problem_desc_2: "Jibu la AskPay ni rahisi: lipa kwa kila swali ukitumia sarafu ya USDm, moja kwa moja kutoka kwenye pochi yako. Hakuna kujisajili, hakuna kadi ya mkopo, hakuna akaunti ya kudhibiti. Gharama ya swali moja ni ndogo sana — na unalipa tu unapotumia.",
    about_problem_desc_3: "Walengwa wakuu ni mtu yeyote katika maeneo ambayo MiniPay tayari ni chombo cha malipo cha kila siku. Kwa watumiaji hao, AskPay ni nyongeza ya kawaida: pochi ile ile wanayotumia kutuma pesa kwa familia sasa inaweza kujibu maswali yao.",
    about_pos_title: "Imejengwa kwa ajili ya Proof of Ship ya Celo",
    about_pos_desc_1: "AskPay ilijengwa kama sehemu ya mpango wa Proof of Ship wa Celo — mpango unaowapa changamoto watengenezaji kusafirisha bidhaa halisi zinazoweza kutumika kwenye Celo badala ya mifano ya majaribio tu.",
    about_pos_desc_2: "Mpango huu unawasukuma watengenezaji kupitia mzunguko kamili wa bidhaa: kutengeneza mkataba, kuusambaza kwenye mainnet, kuunganisha sehemu ya mbele, na kuifanya ipatikane kwa watumiaji halisi. AskPay ni matokeo ya moja kwa moja ya kufanya kazi kupitia mchakato huo.",
    about_why_title: "Kwa nini tulijenga hii",
    about_why_desc_1: "Kusema ukweli, hatua ya kuanza ilikuwa udadisi: inachukua nini hasa kuzuia jibu la AI nyuma ya malipo halisi ya blockchain? Sio malipo ya kuiga, lakini muamala halisi wa blockchain ambao seva inaweza kuthibitisha kabla ya kuuliza AI.",
    about_why_desc_2: "Kufanya muunganisho huo uwe imara bila kupoteza ID za maswali au kushindana na uthibitishaji wa block ilikuwa changamoto ya kiufundi inayovutia. Kifurushi cha use-minipay-paygate kilitokana na kutatua tatizo hilo kwa njia safi.",
    about_builder_title: "Nani aliyejenga",
    about_builder_bio: "Mendelezaji wa Full-stack / Web3 anayejenga kwenye Celo. AskPay ni toleo la Proof of Ship linalochunguza zana za AI za lipa unavyotumia.",
    about_links_title: "Viungo",
    about_built_with_title: "Imejengwa kwa",
    about_built_with_sub: "Kila kitu kilichoorodheshwa hapa kinatumika kwenye codebase — hakuna madai yasiyo ya kweli.",
    about_cta_try: "Jaribu AskPay",

    // How It Works Page
    how_title: "Jinsi Inavyofanya Kazi",
    how_subtitle: "Nyuma ya pazia ya mkataba wa malipo wa AskPay.",
    how_step_1: "1. Swali na Malipo",
    how_step_1_desc: "Unaandika swali lako na kuidhinisha muamala kwenye pochi yako ya Celo. Hii inaweka hasa 0.01 USDm kwenye mkataba wa smart na kutangaza tukio la kipekee la QueryPaid kwenye mtandao.",
    how_step_2: "2. Uthibitishaji wa Seva",
    how_step_2_desc: "Seva yetu inapokea hash ya muamala, inaithibitisha kwenye mtandao wa Celo kupitia use-minipay-paygate, inahakikisha mpokeaji na ID ya swali ni sahihi, na kisha inachukua jibu.",
    how_step_3: "3. Kutiririsha kwa AI",
    how_step_3_desc: "Seva inauliza mfano wa AI (Gemini/Groq) na kutiririsha jibu neno kwa neno kwenye kivinjari chako. Hash ya muamala wako ndiyo stakabadhi yako.",

    // Roadmap Page
    roadmap_title: "Ramani ya AskPay",
    roadmap_subtitle: "Hatua zetu zilizopangwa za kupanua mfumo wa lipa kwa swali.",
    roadmap_phase_1: "Hatua ya 1: Msingi",
    roadmap_phase_1_desc: "Tengeneza mikataba ya smart, weka usambazaji wa testnet wa Celo, na uandae mazingira ya majaribio ya ndani.",
    roadmap_phase_2: "Hatua ya 2: Lango la Malipo",
    roadmap_phase_2_desc: "Weka programu ya uthibitishaji wa malipo ya blockchain na ukamilishe uthibitishaji wa miamala ya USDm kwenye mainnet.",
    roadmap_phase_3: "Hatua ya 3: Mfumo wa AI",
    roadmap_phase_3_desc: "Ongeza kutiririsha kwa majibu, mantiki mbadala ya LLM, vizuizi vya kasi vya IP, na tafsiri ya Kiswahili kwa soko la MiniPay.",

    // Changelog Page
    changelog_title: "Mabadiliko",
    changelog_subtitle: "Sasisho za hivi karibuni zilizosafirishwa kwenye AskPay.",
    changelog_v1_0: "v1.0.0 — Utiririshaji & Kizuizi cha Kasi",
    changelog_v1_0_desc: "Imekamilisha sasisho za Hatua ya 3. Imeongeza utiririshaji wa neno kwa neno, kujaribu tena AI ikichelewa, kizuizi cha IP, na Kiswahili.",

    // Credits Page
    credits_title: "Shukrani & Shukrani za Kipekee",
    credits_subtitle: "Asante kwa maktaba, mitandao, na waundaji waliowezesha AskPay.",

    // Contact Page
    contact_title: "Wasiliana na Mendelezaji",
    contact_subtitle: "Una maoni au maswali? Tuma ujumbe wa moja kwa moja.",
    contact_name: "Jina",
    contact_email: "Barua pepe",
    contact_message: "Ujumbe",
    contact_submit: "Tuma Ujumbe",
    contact_sending: "Inatuma…",
    contact_success: "Ujumbe umetumwa kwa mafanikio!",

    // Legal Page
    legal_title: "Sheria & Sera ya Faragha",
    legal_subtitle: "Jinsi AskPay inavyosimamia miamala, vidakuzi, na data ya ndani.",
    legal_terms_1: "1. Hakuna Akaunti au Usajili",
    legal_terms_1_desc: "AskPay haihifadhi nywila, kadi za mkopo, wala maelezo ya KYC. Unajihusisha tu kupitia miamala ya Celo.",
    legal_terms_2: "2. Sera ya Vidakuzi",
    legal_terms_2_desc: "Tunatumia hifadhi ya ndani ya kivinjari chako pekee kuhifadhi historia yako ya mazungumzo. Hakuna vidakuzi vya ufuatiliaji vinavyotumiwa."
  }
};
