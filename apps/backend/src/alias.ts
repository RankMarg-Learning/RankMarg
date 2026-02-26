import moduleAlias from "module-alias";
import { Buffer } from "buffer";

if (!(require("buffer") as any).SlowBuffer) {
    (require("buffer") as any).SlowBuffer = Buffer;
}

moduleAlias.addAliases({
    "@": __dirname,
});
