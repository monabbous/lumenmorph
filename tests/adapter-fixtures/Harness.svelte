<script>
  import LumenText from "../../svelte/LumenText.svelte";
  let text = $state("Glass");
  window.updateText = value => { text = value; };
</script>
<LumenText {text} width={640} height={120} fontSize={80} />
