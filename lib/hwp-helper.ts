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
        // 1. hwp.js 동적 로드
        const hwpjs = await import('hwp.js');
        const { Viewer, parse } = hwpjs;
        console.log('[hwp-helper] hwp.js modules loaded:', Object.keys(hwpjs));

        // ✅ 핵심:
        //   - type:'binary' + 바이너리 문자열 → zlib "invalid block type" 오류 발생
        //     (문자열 변환 과정에서 압축 데이터 손상)
        //   - type:'array' + Uint8Array → cfb.js가 .split() 호출 안 함, 데이터 손상 없음
        const uint8Data = new Uint8Array(fileData);

        // 2. 파싱 검증
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const doc = parse(uint8Data as any, { type: 'array' });
            console.log('[hwp-helper] Parse successful. Document object:', doc);
        } catch (parseError) {
            console.error('[hwp-helper] parse() failed:', parseError);
            throw new Error(`HWP 파싱 실패: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }

        // 3. Viewer 렌더링
        console.log('[hwp-helper] Attempting to create Viewer with container:', containerElement);

        if (containerElement.clientHeight === 0) {
            console.warn('[hwp-helper] Container height is 0. Setting min-height.');
            containerElement.style.minHeight = '600px';
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const viewer = new Viewer(containerElement, uint8Data as any, { type: 'array' });
        console.log('[hwp-helper] Viewer instance created:', viewer);

        // 4. 렌더링 확인
        setTimeout(() => {
            console.log('[hwp-helper] Container child count after 300ms:', containerElement.childElementCount);
            if (containerElement.childElementCount === 0) {
                console.error('[hwp-helper] Viewer did not add any elements to the container.');
            }
        }, 300);

    } catch (error) {
        console.error('[hwp-helper] Critical error in renderHwp:', error);
        throw error;
    }
}
