import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import type { MDXWrapper } from 'nextra'
import { DocStructuredData } from '@/components/doc-structured-data'
import { Children, isValidElement, type ComponentProps, type ReactNode } from 'react'

const docsComponents = getDocsMDXComponents()
const DocsWrapper = docsComponents.wrapper
const DocsPre = docsComponents.pre

function countNewlines(children: ReactNode): number {
    return Children.toArray(children).reduce<number>((count, child) => {
        if (typeof child === 'string') return count + (child.match(/\n/g)?.length ?? 0)
        return count + (isValidElement<{ children?: ReactNode }>(child)
            ? countNewlines(child.props.children)
            : 0)
    }, 0)
}

function DocCodeBlock(props: ComponentProps<typeof DocsPre>) {
    const lines = countNewlines(props.children) + 1
    if (lines < 40) return <DocsPre {...props} />

    // Keep long examples in the HTML while deferring their off-screen layout.
    // Estimate their unwrapped height from Nextra's line height, padding and header.
    const height = lines * 1.25 + 2 + (props['data-filename'] ? 3 : 0)
    return (
        <div className="doc-code-block" style={{
            contentVisibility: 'auto',
            containIntrinsicBlockSize: `auto ${height}rem`,
        }}>
            <DocsPre {...props} />
        </div>
    )
}

const SeoWrapper: MDXWrapper = props => (
    <>
        <DocStructuredData metadata={props.metadata} />
        <DocsWrapper
            {...props}
            metadata={{
                ...props.metadata,
                // Preserve Nextra feedback links when changing the SEO title.
                title: 'displayTitle' in props.metadata && typeof props.metadata.displayTitle === 'string'
                    ? props.metadata.displayTitle
                    : props.metadata.title,
            }}
        />
    </>
)

export function useMDXComponents(components: any) {
    return {
        ...docsComponents,
        wrapper: SeoWrapper,
        pre: DocCodeBlock,
        ...components
    }
}
