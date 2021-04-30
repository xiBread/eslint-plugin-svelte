import type { JSONSchema4 } from "json-schema"
import type {
  Linter,
  Rule,
  Scope,
  SourceCode as ESLintSourceCode,
} from "eslint"
import type { AST } from "svelte-eslint-parser"
import type * as ESTree from "estree"

export type ASTNode = AST.SvelteNode | ESTree.Node
type ASTNodeWithParent = ASTNode & { parent: ASTNode }
type ASTNodeListenerMap<T extends ASTNodeWithParent = ASTNodeWithParent> = {
  [key in ASTNodeWithParent["type"]]: T extends { type: key } ? T : never
}

type ASTNodeListener = {
  [T in keyof ASTNodeListenerMap]?: (node: ASTNodeListenerMap[T]) => void
}
export interface RuleListener extends ASTNodeListener {
  onCodePathStart?(codePath: Rule.CodePath, node: never): void

  onCodePathEnd?(codePath: Rule.CodePath, node: never): void

  onCodePathSegmentStart?(segment: Rule.CodePathSegment, node: never): void

  onCodePathSegmentEnd?(segment: Rule.CodePathSegment, node: never): void

  onCodePathSegmentLoop?(
    fromSegment: Rule.CodePathSegment,
    toSegment: Rule.CodePathSegment,
    node: never,
  ): void

  [key: string]:
    | ((codePath: Rule.CodePath, node: never) => void)
    | ((segment: Rule.CodePathSegment, node: never) => void)
    | ((
        fromSegment: Rule.CodePathSegment,
        toSegment: Rule.CodePathSegment,
        node: never,
      ) => void)
    | ASTNodeListener[keyof ASTNodeListener]
    | ((node: never) => void)
    | undefined
}

export interface RuleModule {
  meta: RuleMetaData
  create(context: RuleContext): RuleListener
}

export interface RuleMetaData {
  docs: {
    description: string
    recommended: boolean
    extensionRule?: string
    url: string
    ruleId: string
    ruleName: string
    replacedBy?: string[]
    default?: "error" | "warn"
  }
  messages: { [messageId: string]: string }
  fixable?: "code" | "whitespace"
  schema: JSONSchema4 | JSONSchema4[]
  deprecated?: boolean
  type: "problem" | "suggestion" | "layout"
}

export interface PartialRuleModule {
  meta: PartialRuleMetaData
  create: (context: RuleContext) => RuleListener
}

export interface PartialRuleMetaData {
  docs: {
    description: string
    recommended: boolean
    extensionRule?: string
    replacedBy?: string[]
    default?: "error" | "warn"
  }
  messages: { [messageId: string]: string }
  fixable?: "code" | "whitespace"
  schema: JSONSchema4 | JSONSchema4[]
  deprecated?: boolean
  type: "problem" | "suggestion" | "layout"
}

export type RuleContext = {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  options: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  settings: { [name: string]: any }
  parserPath: string
  parserOptions: Linter.ParserOptions
  parserServices: ESLintSourceCode.ParserServices

  getAncestors(): ASTNode[]

  getDeclaredVariables(node: ESTree.Node): Scope.Variable[]

  getFilename(): string

  getScope(): Scope.Scope

  getSourceCode(): SourceCode

  markVariableAsUsed(name: string): boolean

  report(descriptor: ReportDescriptor): void
}

type NodeOrToken = { type: string; loc?: AST.SourceLocation | null }

interface ReportDescriptorOptionsBase {
  data?: { [key: string]: string }

  fix?:
    | null
    | ((
        fixer: RuleFixer,
      ) => null | Rule.Fix | IterableIterator<Rule.Fix> | Rule.Fix[])
}

type SuggestionDescriptorMessage = { desc: string } | { messageId: string }
type SuggestionReportDescriptor = SuggestionDescriptorMessage &
  ReportDescriptorOptionsBase

interface ReportDescriptorOptions extends ReportDescriptorOptionsBase {
  suggest?: SuggestionReportDescriptor[] | null
}

type ReportDescriptor = ReportDescriptorMessage &
  ReportDescriptorLocation &
  ReportDescriptorOptions
type ReportDescriptorMessage = { message: string } | { messageId: string }
type ReportDescriptorLocation =
  | { node: NodeOrToken }
  | { loc: AST.SourceLocation | { line: number; column: number } }

export interface RuleFixer {
  insertTextAfter(nodeOrToken: NodeOrToken, text: string): Rule.Fix

  insertTextAfterRange(range: AST.Range, text: string): Rule.Fix

  insertTextBefore(nodeOrToken: NodeOrToken, text: string): Rule.Fix

  insertTextBeforeRange(range: AST.Range, text: string): Rule.Fix

  remove(nodeOrToken: NodeOrToken): Rule.Fix

  removeRange(range: AST.Range): Rule.Fix

  replaceText(nodeOrToken: NodeOrToken, text: string): Rule.Fix

  replaceTextRange(range: AST.Range, text: string): Rule.Fix
}
// eslint-disable-next-line @typescript-eslint/no-namespace -- ignore
export declare namespace SourceCode {
  export function splitLines(text: string): string[]
}
export interface SourceCode {
  text: string
  ast: AST.SvelteProgram
  lines: string[]
  hasBOM: boolean
  parserServices: ESLintSourceCode.ParserServices
  scopeManager: Scope.ScopeManager
  visitorKeys: ESLintSourceCode.VisitorKeys

  getText(node?: NodeOrToken, beforeCount?: number, afterCount?: number): string

  getLines(): string[]

  getAllComments(): AST.Comment[]

  getComments(
    node: NodeOrToken,
  ): { leading: AST.Comment[]; trailing: AST.Comment[] }

  getJSDocComment(node: NodeOrToken): AST.Comment | null

  getNodeByRangeIndex(index: number): NodeOrToken | null

  isSpaceBetweenTokens(first: AST.Token, second: AST.Token): boolean

  getLocFromIndex(index: number): AST.Position

  getIndexFromLoc(location: AST.Position): number

  // Inherited methods from TokenStore
  // ---------------------------------

  getTokenByRangeStart(
    offset: number,
    options?: { includeComments?: boolean },
  ): AST.Token | AST.Comment | null

  getFirstToken(
    node: NodeOrToken,
    options?: ESLintSourceCode.CursorWithSkipOptions,
  ): AST.Token | AST.Comment | null

  getFirstTokens(
    node: NodeOrToken,
    options?: ESLintSourceCode.CursorWithCountOptions,
  ): (AST.Token | AST.Comment)[]

  getLastToken(
    node: NodeOrToken,
    options?: ESLintSourceCode.CursorWithSkipOptions,
  ): AST.Token | AST.Comment | null

  getLastTokens(
    node: NodeOrToken,
    options?: ESLintSourceCode.CursorWithCountOptions,
  ): (AST.Token | AST.Comment)[]

  getTokenBefore(
    node: NodeOrToken,
    options?: ESLintSourceCode.CursorWithSkipOptions,
  ): AST.Token | AST.Comment | null

  getTokensBefore(
    node: NodeOrToken,
    options?: ESLintSourceCode.CursorWithCountOptions,
  ): (AST.Token | AST.Comment)[]

  getTokenAfter(
    node: NodeOrToken,
    options?: ESLintSourceCode.CursorWithSkipOptions,
  ): AST.Token | AST.Comment | null

  getTokensAfter(
    node: NodeOrToken,
    options?: ESLintSourceCode.CursorWithCountOptions,
  ): (AST.Token | AST.Comment)[]

  getFirstTokenBetween(
    left: NodeOrToken,
    right: NodeOrToken,
    options?: ESLintSourceCode.CursorWithSkipOptions,
  ): AST.Token | AST.Comment | null

  getFirstTokensBetween(
    left: NodeOrToken,
    right: NodeOrToken,
    options?: ESLintSourceCode.CursorWithCountOptions,
  ): (AST.Token | AST.Comment)[]

  getLastTokenBetween(
    left: NodeOrToken,
    right: NodeOrToken,
    options?: ESLintSourceCode.CursorWithSkipOptions,
  ): AST.Token | AST.Comment | null

  getLastTokensBetween(
    left: NodeOrToken,
    right: NodeOrToken,
    options?: ESLintSourceCode.CursorWithCountOptions,
  ): (AST.Token | AST.Comment)[]

  getTokensBetween(
    left: NodeOrToken,
    right: NodeOrToken,
    padding?: ESLintSourceCode.CursorWithCountOptions,
  ): (AST.Token | AST.Comment)[]

  getTokens(
    node: NodeOrToken,
    beforeCount?: number,
    afterCount?: number,
  ): AST.Token[]
  getTokens(
    node: NodeOrToken,
    options: ESLintSourceCode.CursorWithCountOptions,
  ): (AST.Token | AST.Comment)[]

  commentsExistBetween(left: NodeOrToken, right: NodeOrToken): boolean

  getCommentsBefore(nodeOrToken: NodeOrToken | AST.Token): AST.Comment[]

  getCommentsAfter(nodeOrToken: NodeOrToken | AST.Token): AST.Comment[]

  getCommentsInside(node: NodeOrToken): AST.Comment[]
}