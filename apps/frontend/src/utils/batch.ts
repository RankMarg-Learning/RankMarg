export function getBatchParameters(req: Request) {
    const url = new URL(req.url);
    const batchSize = Number(url.searchParams.get('batchSize')) || 100;
    const offset = Number(url.searchParams.get('offset')) || 0;

    return { batchSize, offset };
}
