// The 26 architecture tests in test/architecture/, from the architecture
// finding, sorted into the four kinds the chapter names. The note names the
// bug or the reason each exists.
export const guards = [
  {title: 'The architecture', items: [
    {label: 'architecture_guard', note: 'Firebase imported only under backend/firebase'},
    {label: 'guard_firestore_sweep', note: 'every write inside the error-mapping guard'},
    {label: 'async_when_guard', note: 'no raw .when in the UI, after a spinner that never stopped'},
    {label: 'no_inline_material_app', note: 'widget tests share one app shell, 185 to 0'},
    {label: 'no_display_string_in_ports', note: 'ports carry no display text'},
    {label: 'no_prose_literal_in_backend', note: 'no English prose in the backend'}
  ]},
  {title: 'The screen', items: [
    {label: 'no_raw_dialog', note: 'one dialog shell, after buttons stacked wrongly'},
    {label: 'no_colour_literals', note: 'colour from the theme only, 42 literals found once'},
    {label: 'no_direction_blind_layout', note: 'no left or right geometry'},
    {label: 'directional_glyphs_mirror', note: 'directional icons mirror under RTL'},
    {label: 'no_bare_arrow_glyph', note: 'arrows never flip on their own'},
    {label: 'no_bare_iso_stamp_in_sentence', note: 'a date inside Arabic reorders'},
    {label: 'no_hand_signed_money', note: 'a hand-written sign lands on the wrong side'},
    {label: 'no_offline_suffix', note: 'labels never gain an offline suffix'},
    {label: 'no_unservable_font_weight', note: 'no weight the bundled faces cannot draw'}
  ]},
  {title: 'The books', items: [
    {label: 'no_money_arithmetic_in_literals', note: 'no two amounts in one string'},
    {label: 'no_currency_conversion_in_widgets', note: 'the UI never multiplies by a rate'},
    {label: 'no_double_returned_deduction', note: 'returns subtracted twice, shipped twice'},
    {label: 'no_capital_import_of_staff_pay', note: 'capital does not import wages or rent'},
    {label: 'stock_run_flush', note: 'every stock run flushes, or stock does not move'}
  ]},
  {title: 'The language', items: [
    {label: 'no_bare_date_format', note: 'dates built in one place only'},
    {label: 'no_localized_persisted_note', note: 'ledger notes stay English on the wire'},
    {label: 'no_raw_capital_category_render', note: 'categories shown through their label'},
    {label: 'no_wire_value_in_translated_sentence', note: 'no raw value in a translated line'},
    {label: 'no_unkeyed_app_exception', note: 'every thrown message has a key, 90 sites'},
    {label: 'arabic_arb_contract', note: 'the Arabic file keeps its contract forever'}
  ]}
];
