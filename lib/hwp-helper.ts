/**
 * HWP Documentation & hwp.js Integration Guide
 */

/**
 * ArrayBuffer를 hwp.js가 요구하는 바이너리 문자열로 변환
 * cfb.js 내부에서 type:'binary'일 때 string.split()을 호출하기 때문에 반드시 필요
 */
function arrayBufferToBinaryString(buffer: ArrayBuffer): string {
    const uint8 = new Uint8Array(buffer);
    let binary = '';
    // chunk 단위로 처리하여 call stack overflow 방지
    const CHUNK = 8192;
    for (let i = 0; i < uint8.length; i += CHUNK) {
        binary += String.fromCharCode(...Array.from(uint8.subarray(i, i + CHUNK)));
    }
    return binary;
}

/**
 * .hwp 파일을 클라이언트 사이드에서 렌더링하는 기본 로직 예시
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

        // ✅ 핵심 수정: Uint8Array가 아닌 바이너리 문자열로 변환
        // cfb.js는 type:'binary' 옵션일 때 string.split()을 내부적으로 호출하므로
        // Uint8Array를 넘기면 "t.split is not a function" 에러가 발생함
        const binaryString = arrayBufferToBinaryString(fileData);
        console.log('[hwp-helper] Converted to binary string, length:', binaryString.length);

        // 2. 파싱 검증
        try {
            const doc = parse(binaryString, { type: 'binary' });
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

        // ✅ Viewer에도 동일하게 바이너리 문자열 전달
        const viewer = new Viewer(containerElement, binaryString, { type: 'binary' });
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
