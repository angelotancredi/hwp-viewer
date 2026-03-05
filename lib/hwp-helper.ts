/**
 * HWP Helper - hwp.js Integration
 */

/**
 * .hwp 파일을 클라이언트 사이드에서 렌더링
 *
 * @param fileData ArrayBuffer 형태의 HWP 파일 데이터
 * @param containerElement 렌더링될 HTML Element
 */
export async function renderHwp(fileData: ArrayBuffer, containerElement: HTMLElement) {
    console.log('[hwp-helper] Starting renderHwp. Buffer size:', fileData.byteLength);

    try {
        const hwpjs = await import('hwp.js');
        const { Viewer, parse } = hwpjs;
        console.log('[hwp-helper] hwp.js modules loaded:', Object.keys(hwpjs));

        // hwp.js / cfb.js 가 지원하는 입력 타입을 순서대로 시도
        // 각 시도가 실패하면 다음 방법으로 넘어감
        const strategies: Array<{ label: string; data: unknown; opts: object }> = [
            // 1) ArrayBuffer 직접 전달 (options 없음 - hwp.js 내부 기본값 사용)
            { label: 'ArrayBuffer (no opts)', data: fileData, opts: {} },
            // 2) Uint8Array + type:array
            { label: 'Uint8Array + array', data: new Uint8Array(fileData), opts: { type: 'array' } },
            // 3) 일반 Array + type:array  (Uint8Array를 Array로 변환)
            { label: 'Array + array', data: Array.from(new Uint8Array(fileData)), opts: { type: 'array' } },
            // 4) base64 인코딩 + type:base64
            { label: 'base64', data: btoa(
                new Uint8Array(fileData).reduce((s, b) => s + String.fromCharCode(b), '')
            ), opts: { type: 'base64' } },
        ];

        let lastError: unknown = null;

        for (const strategy of strategies) {
            try {
                console.log(`[hwp-helper] Trying strategy: ${strategy.label}`);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const doc = parse(strategy.data as any, strategy.opts as any);
                console.log(`[hwp-helper] Parse SUCCESS with: ${strategy.label}`, doc);

                if (containerElement.clientHeight === 0) {
                    containerElement.style.minHeight = '600px';
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                new Viewer(containerElement, strategy.data as any, strategy.opts as any);
                console.log(`[hwp-helper] Viewer created with: ${strategy.label}`);

                setTimeout(() => {
                    console.log('[hwp-helper] Child count after 300ms:', containerElement.childElementCount);
                }, 300);

                return; // 성공하면 바로 종료
            } catch (err) {
                console.warn(`[hwp-helper] Strategy "${strategy.label}" failed:`, err);
                lastError = err;
            }
        }

        // 모든 전략 실패
        throw new Error(`HWP 파싱 실패: ${lastError instanceof Error ? lastError.message : String(lastError)}`);

    } catch (error) {
        console.error('[hwp-helper] Critical error in renderHwp:', error);
        throw error;
    }
}
