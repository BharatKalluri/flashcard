import assert from "node:assert/strict";

import { emptyCardFields, toVcf } from "./card";

const vcf = toVcf({
	...emptyCardFields,
	givenName: ["Ada,"],
	familyName: ["Lovelace;"],
	emails: [{ label: "work", value: "ada@example.com" }],
	phones: [{ label: "mobile", value: "+44 20 0000 0000" }],
	note: "Line one\nLine two",
});

assert.match(vcf, /^BEGIN:VCARD\r\nVERSION:4\.0\r\n/);
assert.match(vcf, /FN:Ada\\, Lovelace\\;/);
assert.match(vcf, /N:Lovelace\\;;Ada\\,;;;/);
assert.match(vcf, /EMAIL;TYPE=work:ada@example\.com/);
assert.match(vcf, /TEL;TYPE=mobile:\+44 20 0000 0000/);
assert.match(vcf, /NOTE:Line one\\nLine two/);
assert.match(vcf, /END:VCARD\r\n$/);
assert.throws(() => toVcf(emptyCardFields));
assert.throws(() =>
	toVcf({
		...emptyCardFields,
		givenName: ["Ada"],
		websites: [{ label: "home", value: "not-a-url" }],
	}),
);
assert.throws(() =>
	toVcf({
		...emptyCardFields,
		givenName: ["Ada"],
		emails: [{ label: "home", value: "not-an-email" }],
	}),
);

console.log("card self-test passed");
