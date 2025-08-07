src/components/tarot/DynamicInterpretationPanel.tsx:194:43 - error TS2339: Property 'keywords' does not exist on type 'TarotCard'.

194 const keywords = card.keywords ? card.keywords.join(', ') : '';
~~~~~~~~

src/components/tarot/DynamicInterpretationPanel.tsx:201:51 - error TS2339: Property 'meaning_reversed' does not exist on type 'TarotCard'.

201 const baseMeaning = context.isReversed ? card.meaning_reversed : card.meaning_upright;
~~~~~~~~~~~~~~~~

src/components/tarot/DynamicInterpretationPanel.tsx:201:75 - error TS2339: Property 'meaning_upright' does not exist on type 'TarotCard'.

201 const baseMeaning = context.isReversed ? card.meaning_reversed : card.meaning_upright;
~~~~~~~~~~~~~~~

src/components/tarot/DynamicInterpretationPanel.tsx:208:31 - error TS2339: Property 'keywords' does not exist on type 'TarotCard'.

208 const cardKeywords = card.keywords ? card.keywords.filter(k => emotionalKeywords.some(ek => k.toLowerCase().includes(ek))) : [];
~~~~~~~~

src/components/tarot/DynamicInterpretationPanel.tsx:208:47 - error TS2339: Property 'keywords' does not exist on type 'TarotCard'.

208 const cardKeywords = card.keywords ? card.keywords.filter(k => emotionalKeywords.some(ek => k.toLowerCase().includes(ek))) : [];
~~~~~~~~

src/components/tarot/DynamicInterpretationPanel.tsx:208:63 - error TS7006: Parameter 'k' implicitly has an 'any' type.

208 const cardKeywords = card.keywords ? card.keywords.filter(k => emotionalKeywords.some(ek => k.toLowerCase().includes(ek))) : [];
~

src/components/tarot/DynamicInterpretationPanel.tsx:233:14 - error TS2339: Property 'arcana_type' does not exist on type 'TarotCard'.

233 if (card.arcana_type === 'major') {
~~~~~~~~~~~

src/components/tarot/DynamicInterpretationPanel.tsx:344:29 - error TS2339: Property 'card_number' does not exist on type 'TarotCard'.

344 {selectedCard.card_number || selectedCard.name.charAt(0)}
~~~~~~~~~~~

src/components/tarot/DynamicInterpretationPanel.tsx:365:33 - error TS2339: Property 'arcana_type' does not exist on type 'TarotCard'.

365 {selectedCard.arcana_type} Arcana
~~~~~~~~~~~

src/components/tarot/EnhancedTarotCard.tsx:113:7 - error TS2322: Type '{ hidden: { rotateY: number; scale: number; opacity: number; }; visible: { rotateY: number; scale: number; opacity: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
Property 'visible' is incompatible with index signature.
Type '{ rotateY: number; scale: number; opacity: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
Type '{ rotateY: number; scale: number; opacity: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
Type '{ rotateY: number; scale: number; opacity: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues | undefined; }'.
Types of property 'transition' are incompatible.
Type '{ delay: number; duration: number; type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any>'.
Type '{ delay: number; duration: number; type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
Types of property 'type' are incompatible.
Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.

113 variants={cardVariants}
~~~~~~~~

node_modules/motion-dom/dist/index.d.ts:1778:5
1778 variants?: Variants;
~~~~~~~~
The expected type comes from property 'variants' which is declared here on type 'IntrinsicAttributes & Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLDivElement>'

src/components/tarot/EnhancedTarotSpreadLayouts.tsx:263:15 - error TS2322: Type '{ hidden: { rotateY: number; scale: number; opacity: number; y: number; }; visible: (custom: number) => { rotateY: number; scale: number; opacity: number; y: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }; }' is not assignable to type 'Variants'.
Property 'visible' is incompatible with index signature.
Type '(custom: number) => { rotateY: number; scale: number; opacity: number; y: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
Type '(custom: number) => { rotateY: number; scale: number; opacity: number; y: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetResolver'.
Type '{ rotateY: number; scale: number; opacity: number; y: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }' is not assignable to type 'string | TargetAndTransition'.
Type '{ rotateY: number; scale: number; opacity: number; y: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
Type '{ rotateY: number; scale: number; opacity: number; y: number; transition: { delay: number; duration: number; type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues | undefined; }'.
Types of property 'transition' are incompatible.
Type '{ delay: number; duration: number; type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any>'.
Type '{ delay: number; duration: number; type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
Types of property 'type' are incompatible.
Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.

263 variants={cardVariants}
~~~~~~~~

node_modules/motion-dom/dist/index.d.ts:1778:5
1778 variants?: Variants;
~~~~~~~~
The expected type comes from property 'variants' which is declared here on type 'IntrinsicAttributes & Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLDivElement>'

src/components/tarot/InteractiveReadingSurface.tsx:83:17 - error TS2339: Property 'isAuthenticated' does not exist on type 'AuthContextType'.

83 const { user, isAuthenticated } = useAuth();
~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:210:29 - error TS7053: Element implicitly has an 'any' type because expression of type 'SpreadType' can't be used to index type '{ single: string[]; 'three-card': string[]; 'celtic-cross': string[]; }'.
Property 'horseshoe' does not exist on type '{ single: string[]; 'three-card': string[]; 'celtic-cross': string[]; }'.

210 const positionContext = positionMeanings[spread]?.[position] || `Position ${position + 1} guidance:`;
~~~~~~~~~~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:211:44 - error TS2339: Property 'meaning_reversed' does not exist on type 'TarotCard'.

211 const meaning = card.isReversed ? card.meaning_reversed : card.meaning_upright;
~~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:211:68 - error TS2339: Property 'meaning_upright' does not exist on type 'TarotCard'.

211 const meaning = card.isReversed ? card.meaning_reversed : card.meaning_upright;
~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:297:16 - error TS2339: Property 'sophiaDialogue' does not exist on type 'ConversationTurn'.

297 turn.sophiaDialogue,
~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:299:11 - error TS2345: Argument of type '{ card: TarotCard; position: string; interpretation?: PersonalizedInterpretation | undefined; } | undefined' is not assignable to parameter of type '{ card: any; interpretation: string; } | undefined'.
Type '{ card: TarotCard; position: string; interpretation?: PersonalizedInterpretation | undefined; }' is not assignable to type '{ card: any; interpretation: string; }'.
Types of property 'interpretation' are incompatible.
Type 'PersonalizedInterpretation | undefined' is not assignable to type 'string'.
Type 'undefined' is not assignable to type 'string'.

299 turn.revealedCard
~~~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:350:49 - error TS2339: Property 'getAccessToken' does not exist on type 'User'.

350 'Authorization': `Bearer ${await user.getAccessToken()}`
~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:360:45 - error TS2339: Property 'meaning_reversed' does not exist on type 'TarotCard'.

360 meaning: card.isReversed ? card.meaning_reversed : card.meaning_upright
~~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:360:69 - error TS2339: Property 'meaning_upright' does not exist on type 'TarotCard'.

360 meaning: card.isReversed ? card.meaning_reversed : card.meaning_upright
~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:483:25 - error TS2345: Argument of type '{ journalEntry: string | undefined; interpretation: string; cards: TarotCard[]; sophiaReading: SophiaReading | null; id: string; spreadType: SpreadType; timestamp: Date; isGuest: boolean; }' is not assignable to parameter of type 'ReadingSession'.
Types of property 'sophiaReading' are incompatible.
Type 'SophiaReading | null' is not assignable to type 'SophiaReading | undefined'.
Type 'null' is not assignable to type 'SophiaReading | undefined'.

483 onReadingComplete?.(sessionWithJournal);
~~~~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:675:58 - error TS2339: Property 'CARD_INTERPRETATION' does not exist on type 'typeof ConversationState'.

675 conversationState === ConversationState.CARD_INTERPRETATION ? 'Interpreting your cards...' :
~~~~~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:676:58 - error TS2339: Property 'ASKING_QUESTION' does not exist on type 'typeof ConversationState'.

676 conversationState === ConversationState.ASKING_QUESTION ? 'Learning about you...' :
~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:677:58 - error TS2339: Property 'AWAITING_USER_RESPONSE' does not exist on type 'typeof ConversationState'.

677 conversationState === ConversationState.AWAITING_USER_RESPONSE ? 'Waiting for your response...' :
~~~~~~~~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:678:58 - error TS2339: Property 'PROVIDING_GUIDANCE' does not exist on type 'typeof ConversationState'.

678 conversationState === ConversationState.PROVIDING_GUIDANCE ? 'Sharing guidance...' :
~~~~~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:688:59 - error TS2339: Property 'sophiaDialogue' does not exist on type 'ConversationTurn'.

688 <p className="leading-relaxed">{currentTurn.sophiaDialogue}</p>
~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:708:19 - error TS2322: Type 'PersonalizedInterpretation | undefined' is not assignable to type 'ReactNode'.
Type 'PersonalizedInterpretation' is not assignable to type 'ReactNode'.

708 {currentTurn.revealedCard.interpretation}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

node_modules/@types/react/index.d.ts:2173:9
2173 children?: ReactNode | undefined;
~~~~~~~~
The expected type comes from property 'children' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>'

src/components/tarot/InteractiveReadingSurface.tsx:725:52 - error TS2339: Property 'context' does not exist on type 'InteractiveQuestion'.

725 {currentTurn.interactiveQuestion.context}
~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:758:29 - error TS2339: Property 'hint' does not exist on type 'ConversationOption'.

758 {option.hint && (
~~~~

src/components/tarot/InteractiveReadingSurface.tsx:760:33 - error TS2339: Property 'hint' does not exist on type 'ConversationOption'.

760 {option.hint}
~~~~

src/components/tarot/InteractiveReadingSurface.tsx:922:29 - error TS2339: Property 'arcana_type' does not exist on type 'TarotCard'.

922 {card.arcana_type === 'major' ? 'Major Arcana' : `${card.suit} - Minor`}
~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:1099:56 - error TS2339: Property 'sophiaDialogue' does not exist on type 'ConversationTurn'.

1099 <p className="opacity-75">"{turn.sophiaDialogue.substring(0, 100)}..."</p>
~~~~~~~~~~~~~~

src/components/tarot/InteractiveReadingSurface.tsx:1137:25 - error TS2339: Property 'arcana_type' does not exist on type 'TarotCard'.

1137 {card.arcana_type === 'major' ? 'Major Arcana' : `${card.suit} - Minor`}
~~~~~~~~~~~

src/hooks/useProfileAutofill.ts:56:34 - error TS2339: Property 'preferredTarotReader' does not exist on type '{ birthDate?: string | undefined; birthTime?: string | undefined; birthLocation?: string | undefined; birthCoordinates?: { lat: number; lng: number; } | undefined; }'.

56 preferredTarotReader: data.preferredTarotReader || ''
~~~~~~~~~~~~~~~~~~~~

src/lib/astrology/CareerAnalyzer.ts:78:44 - error TS2339: Property 'number' does not exist on type 'HousePosition'.

78 secondHouse: `House ${chart.houses[1]?.number || 2}: ${chart.houses[1]?.sign || 'Unknown'} - Your relationship with money and values`,
~~~~~~

src/lib/astrology/CareerAnalyzer.ts:78:77 - error TS2339: Property 'sign' does not exist on type 'HousePosition'.

78 secondHouse: `House ${chart.houses[1]?.number || 2}: ${chart.houses[1]?.sign || 'Unknown'} - Your relationship with money and values`,
~~~~

src/lib/astrology/CareerAnalyzer.ts:79:43 - error TS2339: Property 'number' does not exist on type 'HousePosition'.

79 sixthHouse: `House ${chart.houses[5]?.number || 6}: ${chart.houses[5]?.sign || 'Unknown'} - Your daily work and health approach`,
~~~~~~

src/lib/astrology/CareerAnalyzer.ts:79:76 - error TS2339: Property 'sign' does not exist on type 'HousePosition'.

79 sixthHouse: `House ${chart.houses[5]?.number || 6}: ${chart.houses[5]?.sign || 'Unknown'} - Your daily work and health approach`,
~~~~

src/lib/astrology/CareerAnalyzer.ts:80:43 - error TS2339: Property 'number' does not exist on type 'HousePosition'.

80 tenthHouse: `House ${chart.houses[9]?.number || 10}: ${chart.houses[9]?.sign || 'Unknown'} - Your public reputation and achievement`
~~~~~~

src/lib/astrology/CareerAnalyzer.ts:80:77 - error TS2339: Property 'sign' does not exist on type 'HousePosition'.

80 tenthHouse: `House ${chart.houses[9]?.number || 10}: ${chart.houses[9]?.sign || 'Unknown'} - Your public reputation and achievement`
~~~~

src/lib/astrology/CareerAnalyzer.ts:386:5 - error TS2739: Type '{ midheaven: string; saturn: string; mars: string; }' is missing the following properties from type '{ midheaven: string; saturn: string; mars: string; secondHouse: string; sixthHouse: string; tenthHouse: string; }': secondHouse, sixthHouse, tenthHouse

386 keyPlacements: {
~~~~~~~~~~~~~

src/lib/astrology/CareerAnalyzer.ts:28:3
28 keyPlacements: {
~~~~~~~~~~~~~
The expected type comes from property 'keyPlacements' which is declared here on type 'CareerAnalysis'

src/lib/astrology/SwissEphemerisShim.ts:78:40 - error TS2339: Property 'swe_utc_to_jd' does not exist on type '{}'.

78 if (this.swisseph && this.swisseph.swe_utc_to_jd) {
~~~~~~~~~~~~~

src/lib/astrology/SwissEphemerisShim.ts:80:38 - error TS2339: Property 'swe_utc_to_jd' does not exist on type '{}'.

80 const result = this.swisseph.swe_utc_to_jd(year, month, day, hour, 0, 0, 1);
~~~~~~~~~~~~~

src/lib/astrology/SwissEphemerisShim.ts:112:40 - error TS2339: Property 'swe_calc_ut' does not exist on type '{}'.

112 if (this.swisseph && this.swisseph.swe_calc_ut) {
~~~~~~~~~~~

src/lib/astrology/SwissEphemerisShim.ts:115:38 - error TS2339: Property 'swe_calc_ut' does not exist on type '{}'.

115 const result = this.swisseph.swe_calc_ut(jd, planetNum, flags);
~~~~~~~~~~~

src/lib/astrology/SwissEphemerisShim.ts:377:40 - error TS2339: Property 'swe_houses' does not exist on type '{}'.

377 if (this.swisseph && this.swisseph.swe_houses) {
~~~~~~~~~~

src/lib/astrology/SwissEphemerisShim.ts:379:38 - error TS2339: Property 'swe_houses' does not exist on type '{}'.

379 const result = this.swisseph.swe_houses(jd, latitude, longitude, 'P'.charCodeAt(0));
~~~~~~~~~~

src/lib/astrology/SwissEphemerisShim.ts:457:49 - error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
Type 'undefined' is not assignable to type 'number'.

457 const houses = this.calculateHouses(jd, birthData.latitude, birthData.longitude);
~~~~~~~~~~~~~~~~~~

src/lib/astrology/SwissEphemerisShim.ts:479:11 - error TS2353: Object literal may only specify known properties, and 'symbol' does not exist in type 'PlanetPosition'.

479 symbol: symbol,
~~~~~~

src/lib/astrology/SwissEphemerisShim.ts:494:49 - error TS2345: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.
Type 'undefined' is not assignable to type 'number'.

494 const houseCusps = this.calculateHouses(jd, birthData.latitude, birthData.longitude);
~~~~~~~~~~~~~~~~~~

src/lib/astrology/SwissEphemerisShim.ts:495:11 - error TS2322: Type '{ number: number; cusp: number; sign: string; ruler: string; }[]' is not assignable to type 'HousePosition[]'.
Type '{ number: number; cusp: number; sign: string; ruler: string; }' is missing the following properties from type 'HousePosition': house, longitude, zodiacSign, zodiacDegree

495 const houses: HousePosition[] = houseCusps.map((cusp, i) => ({
~~~~~~

src/lib/astrology/SynastryCalculator.ts:385:41 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

385 const element = signElements[planet.sign];
~~~~

src/lib/ephemeris/transitEngine.ts:8:21 - error TS2305: Module '"@/types/astrology"' has no exported member 'Planet'.

8 import { BirthData, Planet, AspectType, HouseSystem } from '@/types/astrology';
~~~~~~

src/lib/ephemeris/transitEngine.ts:8:29 - error TS2305: Module '"@/types/astrology"' has no exported member 'AspectType'.

8 import { BirthData, Planet, AspectType, HouseSystem } from '@/types/astrology';
~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:8:41 - error TS2305: Module '"@/types/astrology"' has no exported member 'HouseSystem'.

8 import { BirthData, Planet, AspectType, HouseSystem } from '@/types/astrology';
~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:87:47 - error TS2576: Property 'calculatePlanetaryPosition' does not exist on type 'AstronomicalCalculator'. Did you mean to access the static member 'AstronomicalCalculator.calculatePlanetaryPosition' instead?

87 const position = await this.astroCalc.calculatePlanetaryPosition(planet, today);
~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:120:42 - error TS2576: Property 'calculatePlanetaryPosition' does not exist on type 'AstronomicalCalculator'. Did you mean to access the static member 'AstronomicalCalculator.calculatePlanetaryPosition' instead?

120 const today = await this.astroCalc.calculatePlanetaryPosition(planet, date);
~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:129:44 - error TS2576: Property 'calculatePlanetaryPosition' does not exist on type 'AstronomicalCalculator'. Did you mean to access the static member 'AstronomicalCalculator.calculatePlanetaryPosition' instead?

129 const nextDay = await this.astroCalc.calculatePlanetaryPosition(planet, tomorrow);
~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:175:47 - error TS2339: Property 'calculateBirthChart' does not exist on type 'AstronomicalCalculator'.

175 const natalChart = await this.astroCalc.calculateBirthChart(birthData);
~~~~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:250:25 - error TS7053: Element implicitly has an 'any' type because expression of type 'AspectType' can't be used to index type '{ conjunction: number; sextile: number; square: number; trine: number; opposition: number; }'.

250 const targetAngle = aspectAngles[aspectType];
~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:265:12 - error TS7053: Element implicitly has an 'any' type because expression of type 'AspectType' can't be used to index type '{ conjunction: number; sextile: number; square: number; trine: number; opposition: number; }'.

265 return orbs[aspectType] || 3;
~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:280:25 - error TS7053: Element implicitly has an 'any' type because expression of type 'AspectType' can't be used to index type '{ conjunction: number; sextile: number; square: number; trine: number; opposition: number; }'.

280 const targetAngle = aspectAngles[aspectType];
~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:316:43 - error TS2576: Property 'calculatePlanetaryPosition' does not exist on type 'AstronomicalCalculator'. Did you mean to access the static member 'AstronomicalCalculator.calculatePlanetaryPosition' instead?

316 const sunPos = await this.astroCalc.calculatePlanetaryPosition('sun', date);
~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:317:44 - error TS2576: Property 'calculatePlanetaryPosition' does not exist on type 'AstronomicalCalculator'. Did you mean to access the static member 'AstronomicalCalculator.calculatePlanetaryPosition' instead?

317 const moonPos = await this.astroCalc.calculatePlanetaryPosition('moon', date);
~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:451:103 - error TS7053: Element implicitly has an 'any' type because expression of type 'AspectType' can't be used to index type '{ conjunction: string; sextile: string; square: string; trine: string; opposition: string; }'.

451 return `${majorTransit.transitPlanet} ${majorTransit.aspect} ${majorTransit.natalPlanet} brings ${themes[majorTransit.aspect]}. ${dailyTransit.cosmicWeather.energy === 'high' ? 'High energy day' : dailyTransit.cosmicWeather.energy === 'low' ? 'Reflective day' : 'Balanced energy'}.`;
~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:500:41 - error TS2339: Property 'birthDate' does not exist on type 'BirthData'.

500 const birthDay = new Date(birthData.birthDate).getDate();
~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:501:43 - error TS2339: Property 'birthDate' does not exist on type 'BirthData'.

501 const birthMonth = new Date(birthData.birthDate).getMonth() + 1;
~~~~~~~~~

src/lib/ephemeris/transitEngine.ts:576:23 - error TS7053: Element implicitly has an 'any' type because expression of type 'Planet' can't be used to index type '{ sun: number; moon: number; mercury: number; venus: number; mars: number; jupiter: number; saturn: number; uranus: number; neptune: number; pluto: number; }'.

576 const longitude = approximatePositions[planet] || 0;
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/services/astrology/SwissEphemerisService.ts:1:22 - error TS2307: Cannot find module 'swisseph-v2' or its corresponding type declarations.

1 import Swisseph from 'swisseph-v2';
~~~~~~~~~~~~~

src/services/TarotService.ts:40:28 - error TS2339: Property 'position' does not exist on type 'TarotCardData'.

40 position: card.position || '',
~~~~~~~~

tests/api/oracle/daily-oracle.test.ts:11:1 - error TS2322: Type 'Mock<UnknownFunction>' is not assignable to type '{ (input: URL | RequestInfo, init?: RequestInit | undefined): Promise<Response>; (input: string | URL | Request, init?: RequestInit | undefined): Promise<...>; }'.
Type 'unknown' is not assignable to type 'Promise<Response>'.

11 global.fetch = jest.fn();

```

tests/api/oracle/daily-oracle.test.ts:51:19 - error TS2322: Type 'null' is not assignable to type 'string | undefined'.

51                   suit: null,
                  ~~~~

src/types/oracle.ts:15:3
 15   suit?: string;
      ~~~~
 The expected type comes from property 'suit' which is declared here on type 'TarotCardOracleData'

tests/api/oracle/daily-oracle.test.ts:71:19 - error TS2322: Type 'null' is not assignable to type 'string | undefined'.

71                   suit: null,
                  ~~~~

src/types/oracle.ts:15:3
 15   suit?: string;
      ~~~~
 The expected type comes from property 'suit' which is declared here on type 'TarotCardOracleData'

tests/api/oracle/daily-oracle.test.ts:91:19 - error TS2322: Type 'null' is not assignable to type 'string | undefined'.

91                   suit: null,
                  ~~~~

src/types/oracle.ts:15:3
 15   suit?: string;
      ~~~~
 The expected type comes from property 'suit' which is declared here on type 'TarotCardOracleData'

tests/astrology/validation.test.ts:235:21 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

235         expect(sun?.sign).toBe(expectedSunSign);
                     ~~~~

tests/astrology/validation.test.ts:249:47 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

249         console.log(`✓ ${name}: Sun in ${sun?.sign} at ${sun?.longitude.toFixed(2)}° (${notes})`);
                                               ~~~~

tests/astrology/validation.test.ts:264:24 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

264           expect(moon?.sign).toBe(expectedMoonSign);
                        ~~~~

tests/astrology/validation.test.ts:265:51 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

265           console.log(`✓ ${name}: Moon in ${moon?.sign} at ${moon?.longitude.toFixed(2)}° (${notes})`);
                                                   ~~~~

tests/astrology/validation.test.ts:283:24 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

283         expect(planet?.sign).toMatch(/^(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)$/);
                        ~~~~

tests/astrology/validation.test.ts:284:24 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

284         expect(planet?.house).toBeGreaterThanOrEqual(1);
                        ~~~~~

tests/astrology/validation.test.ts:285:24 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

285         expect(planet?.house).toBeLessThanOrEqual(12);
                        ~~~~~

tests/astrology/validation.test.ts:287:80 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

287         console.log(`${planetName}: ${planet?.longitude.toFixed(2)}° ${planet?.sign} in House ${planet?.house}`);
                                                                                ~~~~

tests/astrology/validation.test.ts:287:105 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

287         console.log(`${planetName}: ${planet?.longitude.toFixed(2)}° ${planet?.sign} in House ${planet?.house}`);
                                                                                                         ~~~~~

tests/astrology/validation.test.ts:329:22 - error TS2339: Property 'number' does not exist on type 'HousePosition'.

329         expect(house.number).toBe(i + 1);
                      ~~~~~~

tests/astrology/validation.test.ts:330:22 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

330         expect(house.cusp).toBeGreaterThanOrEqual(0);
                      ~~~~

tests/astrology/validation.test.ts:331:22 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

331         expect(house.cusp).toBeLessThan(360);
                      ~~~~

tests/astrology/validation.test.ts:332:22 - error TS2339: Property 'sign' does not exist on type 'HousePosition'.

332         expect(house.sign).toMatch(/^(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)$/);
                      ~~~~

tests/astrology/validation.test.ts:333:22 - error TS2339: Property 'ruler' does not exist on type 'HousePosition'.

333         expect(house.ruler).toMatch(/^(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)$/);
                      ~~~~~

tests/astrology/validation.test.ts:337:52 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

337       expect(chart.ascendant).toBe(chart.houses[0].cusp);
                                                    ~~~~

tests/astrology/validation.test.ts:338:52 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

338       expect(chart.midheaven).toBe(chart.houses[9].cusp);
                                                    ~~~~

tests/astrology/validation.test.ts:340:80 - error TS2339: Property 'sign' does not exist on type 'HousePosition'.

340       console.log(`Ascendant: ${chart.ascendant.toFixed(2)}° ${chart.houses[0].sign}`);
                                                                                ~~~~

tests/astrology/validation.test.ts:341:80 - error TS2339: Property 'sign' does not exist on type 'HousePosition'.

341       console.log(`Midheaven: ${chart.midheaven.toFixed(2)}° ${chart.houses[9].sign}`);
                                                                                ~~~~

tests/astrology/validation.test.ts:350:23 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

350         expect(planet.house).toBeGreaterThanOrEqual(1);
                       ~~~~~

tests/astrology/validation.test.ts:351:23 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

351         expect(planet.house).toBeLessThanOrEqual(12);
                       ~~~~~

tests/astrology/validation.test.ts:354:43 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

354         const house = chart.houses[planet.house - 1];
                                           ~~~~~

tests/astrology/validation.test.ts:355:47 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

355         const nextHouse = chart.houses[planet.house % 12];
                                               ~~~~~

tests/astrology/validation.test.ts:358:23 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

358         if (nextHouse.cusp < house.cusp) {
                       ~~~~

tests/astrology/validation.test.ts:358:36 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

358         if (nextHouse.cusp < house.cusp) {
                                    ~~~~

tests/astrology/validation.test.ts:359:44 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

359           expect(planet.longitude >= house.cusp || planet.longitude < nextHouse.cusp).toBe(true);
                                            ~~~~

tests/astrology/validation.test.ts:359:81 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

359           expect(planet.longitude >= house.cusp || planet.longitude < nextHouse.cusp).toBe(true);
                                                                                 ~~~~

tests/astrology/validation.test.ts:361:65 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

361           expect(planet.longitude).toBeGreaterThanOrEqual(house.cusp);
                                                                 ~~~~

tests/astrology/validation.test.ts:362:59 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

362           expect(planet.longitude).toBeLessThan(nextHouse.cusp);
                                                           ~~~~

tests/astrology/validation.test.ts:365:53 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

365         console.log(`${planet.name}: House ${planet.house} (${planet.longitude.toFixed(2)}° between ${house.cusp.toFixed(2)}° and ${nextHouse.cusp.toFixed(2)}°)`);
                                                     ~~~~~

tests/astrology/validation.test.ts:365:109 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

365         console.log(`${planet.name}: House ${planet.house} (${planet.longitude.toFixed(2)}° between ${house.cusp.toFixed(2)}° and ${nextHouse.cusp.toFixed(2)}°)`);
                                                                                                             ~~~~

tests/astrology/validation.test.ts:365:143 - error TS2339: Property 'cusp' does not exist on type 'HousePosition'.

365         console.log(`${planet.name}: House ${planet.house} (${planet.longitude.toFixed(2)}° between ${house.cusp.toFixed(2)}° and ${nextHouse.cusp.toFixed(2)}°)`);
                                                                                                                                               ~~~~

tests/astrology/validation.test.ts:395:51 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

395         expect(test.expectedSigns).toContain(sun?.sign);
                                                   ~~~~

tests/astrology/validation.test.ts:397:57 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

397         console.log(`${test.description}: Sun in ${sun?.sign} at ${sun?.longitude.toFixed(4)}°`);
                                                         ~~~~

tests/astrology/validation.test.ts:422:25 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

422           expect(planet.sign).toBeDefined();
                         ~~~~

tests/astrology/validation.test.ts:423:25 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

423           expect(planet.house).toBeGreaterThanOrEqual(1);
                         ~~~~~

tests/astrology/validation.test.ts:424:25 - error TS2339: Property 'house' does not exist on type 'PlanetPosition'.

424           expect(planet.house).toBeLessThanOrEqual(12);
                         ~~~~~

tests/astrology/validation.test.ts:428:21 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

428         expect(sun?.sign).toBe(era.figure.expectedSunSign);
                     ~~~~

tests/astrology/validation.test.ts:544:19 - error TS2339: Property 'sign' does not exist on type 'PlanetPosition'.

544       expect(sun?.sign).toBe('Pisces'); // Feb 29 should be in Pisces
                   ~~~~

tests/astrology/validation.test.ts:569:10 - error TS2304: Cannot find name 'historicalFigures'.

569 export { historicalFigures };
          ~~~~~~~~~~~~~~~~~

tests/daily-oracle/astrology-horoscopes.test.ts:40:26 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ aries: string; leo: string; sagittarius: string; taurus: string; virgo: string; capricorn: string; gemini: string; libra: string; aquarius: string; cancer: string; scorpio: string; pisces: string; }'.
No index signature with a parameter of type 'string' was found on type '{ aries: string; leo: string; sagittarius: string; taurus: string; virgo: string; capricorn: string; gemini: string; libra: string; aquarius: string; cancer: string; scorpio: string; pisces: string; }'.

40                 element: zodiacElements[sign],
                         ~~~~~~~~~~~~~~~~~~~~

tests/daily-oracle/astrology-horoscopes.test.ts:41:27 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ aries: string; cancer: string; libra: string; capricorn: string; taurus: string; leo: string; scorpio: string; aquarius: string; gemini: string; virgo: string; sagittarius: string; pisces: string; }'.
No index signature with a parameter of type 'string' was found on type '{ aries: string; cancer: string; libra: string; capricorn: string; taurus: string; leo: string; scorpio: string; aquarius: string; gemini: string; virgo: string; sagittarius: string; pisces: string; }'.

41                 modality: zodiacModalities[sign],
                          ~~~~~~~~~~~~~~~~~~~~~~

tests/daily-oracle/astrology-horoscopes.test.ts:80:40 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ aries: string; leo: string; sagittarius: string; taurus: string; virgo: string; capricorn: string; gemini: string; libra: string; aquarius: string; cancer: string; scorpio: string; pisces: string; }'.
No index signature with a parameter of type 'string' was found on type '{ aries: string; leo: string; sagittarius: string; taurus: string; virgo: string; capricorn: string; gemini: string; libra: string; aquarius: string; cancer: string; scorpio: string; pisces: string; }'.

80         expect(horoscope.element).toBe(zodiacElements[sign]);
                                       ~~~~~~~~~~~~~~~~~~~~

tests/daily-oracle/astrology-horoscopes.test.ts:81:41 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ aries: string; cancer: string; libra: string; capricorn: string; taurus: string; leo: string; scorpio: string; aquarius: string; gemini: string; virgo: string; sagittarius: string; pisces: string; }'.
No index signature with a parameter of type 'string' was found on type '{ aries: string; cancer: string; libra: string; capricorn: string; taurus: string; leo: string; scorpio: string; aquarius: string; gemini: string; virgo: string; sagittarius: string; pisces: string; }'.

81         expect(horoscope.modality).toBe(zodiacModalities[sign]);
                                        ~~~~~~~~~~~~~~~~~~~~~~

tests/daily-oracle/astrology-horoscopes.test.ts:112:26 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ aries: string; leo: string; sagittarius: string; taurus: string; virgo: string; capricorn: string; gemini: string; libra: string; aquarius: string; cancer: string; scorpio: string; pisces: string; }'.
No index signature with a parameter of type 'string' was found on type '{ aries: string; leo: string; sagittarius: string; taurus: string; virgo: string; capricorn: string; gemini: string; libra: string; aquarius: string; cancer: string; scorpio: string; pisces: string; }'.

112                 element: zodiacElements[sign],
                          ~~~~~~~~~~~~~~~~~~~~

tests/daily-oracle/astrology-horoscopes.test.ts:113:27 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ aries: string; cancer: string; libra: string; capricorn: string; taurus: string; leo: string; scorpio: string; aquarius: string; gemini: string; virgo: string; sagittarius: string; pisces: string; }'.
No index signature with a parameter of type 'string' was found on type '{ aries: string; cancer: string; libra: string; capricorn: string; taurus: string; leo: string; scorpio: string; aquarius: string; gemini: string; virgo: string; sagittarius: string; pisces: string; }'.

113                 modality: zodiacModalities[sign],
                           ~~~~~~~~~~~~~~~~~~~~~~

tests/daily-oracle/daily-oracle-api.test.ts:185:16 - error TS18046: 'error' is of type 'unknown'.

185         expect(error.message).toBe('Network error');
                ~~~~~

tests/daily-oracle/setup.ts:41:8 - error TS7017: Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.

41 global.testUtils = {
       ~~~~~~~~~

tests/daily-oracle/tarot-spreads.test.ts:421:46 - error TS7006: Parameter 'tag' implicitly has an 'any' type.

421       const hasCardTags = metadata.tags.some(tag => tag.startsWith('tarot_'));
                                              ~~~

tests/daily-oracle/tarot-spreads.test.ts:422:48 - error TS7006: Parameter 'tag' implicitly has an 'any' type.

422       const hasSpreadTags = metadata.tags.some(tag => tag.startsWith('spread_'));
                                                ~~~

tests/e2e/api-validation.spec.ts:220:13 - error TS2322: Type '{ 'Content-Type': string; } | { 'Content-Type'?: undefined; }' is not assignable to type '{ [key: string]: string; } | undefined'.
Type '{ 'Content-Type'?: undefined; }' is not assignable to type '{ [key: string]: string; }'.
 Property ''Content-Type'' is incompatible with index signature.
   Type 'undefined' is not assignable to type 'string'.

220             headers: errorTest.headers || {}
             ~~~~~~~

tests/e2e/performance-audit.spec.ts:113:7 - error TS7006: Parameter 'entry' implicitly has an 'any' type.

113       entry => entry.entryType === 'largest-contentful-paint'
       ~~~~~

tests/e2e/performance-audit.spec.ts:187:80 - error TS2769: No overload matches this call.
Overload 1 of 3, '(callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown, initialValue: unknown): unknown', gave the following error.
 Argument of type '(sum: number, count: number) => number' is not assignable to parameter of type '(previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown'.
   Types of parameters 'sum' and 'previousValue' are incompatible.
     Type 'unknown' is not assignable to type 'number'.
Overload 2 of 3, '(callbackfn: (previousValue: number, currentValue: unknown, currentIndex: number, array: unknown[]) => number, initialValue: number): number', gave the following error.
 Argument of type '(sum: number, count: number) => number' is not assignable to parameter of type '(previousValue: number, currentValue: unknown, currentIndex: number, array: unknown[]) => number'.
   Types of parameters 'count' and 'currentValue' are incompatible.
     Type 'unknown' is not assignable to type 'number'.

187       totalMutations: Object.values((window as any).renderCounts || {}).reduce((sum: number, count: number) => sum + count, 0)
                                                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



Found 344 errors in 59 files.

Errors  Files
  2  scripts/benchmark-einstein-cache.ts:34
  1  scripts/debug-swisseph-positions.ts:11
  2  scripts/ingest-astrology-knowledge.ts:10
  8  scripts/test-astrology-calculations.ts:30
  1  scripts/test-astrology-guru.ts:7
  4  scripts/test-caching-einstein.ts:158
  5  scripts/test-complete-deck.ts:10
 29  scripts/test-conversational-flow.ts:23
  4  scripts/test-daily-oracle.ts:96
 12  scripts/test-fallback-calculations.ts:29
  8  scripts/test-horoscope-engine.ts:87
 15  scripts/test-horoscope-generation.ts:86
  5  scripts/test-marketplace-features.ts:57
  5  scripts/test-persona-learning-loop.ts:37
  8  scripts/test-sophia-personalization.ts:10
  4  scripts/test-swiss-ephemeris-shim.ts:30
  7  scripts/test-swisseph-direct.ts:11
  5  scripts/validate-einstein-chart.ts:26
  8  scripts/validate-ephemeris-accuracy.ts:47
  2  scripts/validate-knowledge-pool.ts:223
  4  src/agents/astrology-guru.ts:8
  6  src/agents/content-ingestor.ts:8
  2  src/agents/lunar-transit-narrator.ts:11
  9  src/agents/PersonaLearner.ts:102
  2  src/agents/personalization-orchestrator.ts:8
 10  src/agents/sophia.ts:164
  2  src/agents/swiss-ephemeris-shim.ts:8
  2  src/agents/tarot-deck-seeder.ts:8
  2  src/agents/ux-narrator.ts:8
  2  src/agents/validation-runner.ts:8
  5  src/app/api/astrology/calculate/route.ts:102
  2  src/app/api/oracle/daily/route.ts:487
  1  src/app/api/stripe/create-checkout-session/route.ts:5
  1  src/app/horoscope/page.tsx:23
  6  src/app/test-save-reading/page.tsx:23
 17  src/components/astrology/InteractiveBirthChart.tsx:252
  1  src/components/astrology/LocationInput.tsx:44
  1  src/components/astrology/MercuryRetrogradeBanner.tsx:24
  1  src/components/forms/LocationInput.tsx:44
  1  src/components/readers/VirtualReaderDisplay.tsx:42
 15  src/components/tarot/DynamicInterpretationPanel.tsx:177
  1  src/components/tarot/EnhancedTarotCard.tsx:113
  1  src/components/tarot/EnhancedTarotSpreadLayouts.tsx:263
 22  src/components/tarot/InteractiveReadingSurface.tsx:83
  1  src/hooks/useProfileAutofill.ts:56
  7  src/lib/astrology/CareerAnalyzer.ts:78
 10  src/lib/astrology/SwissEphemerisShim.ts:78
  1  src/lib/astrology/SynastryCalculator.ts:385
 16  src/lib/ephemeris/transitEngine.ts:8
  1  src/services/astrology/SwissEphemerisService.ts:1
  1  src/services/TarotService.ts:40
  4  tests/api/oracle/daily-oracle.test.ts:11
 39  tests/astrology/validation.test.ts:235
  6  tests/daily-oracle/astrology-horoscopes.test.ts:40
  1  tests/daily-oracle/daily-oracle-api.test.ts:185
  1  tests/daily-oracle/setup.ts:41
  2  tests/daily-oracle/tarot-spreads.test.ts:421
  1  tests/e2e/api-validation.spec.ts:220
  2  tests/e2e/performance-audit.spec.ts:113
```
