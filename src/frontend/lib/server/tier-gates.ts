type TierGateInput = {
    djId: string;
    feature: "custom_event_designs";
  };
  
  export async function isTierAllowedForFeature(
    _input: TierGateInput,
  ): Promise<boolean> {
    // Phase 0/1 behavior: always allow. IDEA-009 will implement real checks.
    return true;
  }