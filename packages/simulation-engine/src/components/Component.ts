/**
 * Base interface for simulation components.
 * Each component models a piece of infrastructure that adds latency.
 */
export interface Component {
  /** Human-readable name for identification */
  name: string;

  /**
   * Process a request and return the latency added by this component.
   * @returns Latency in seconds
   */
  processRequest(): number;
}
